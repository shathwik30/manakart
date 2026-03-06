import { NextRequest } from "next/server";
import { db } from "@/db";
import { products, productOptions, productOptionValues, productVariants } from "@/db/schema";
import { eq, and, or, desc, isNull, ilike, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse, slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    const conditions: any[] = [isNull(products.deletedAt)];
    if (search) {
      conditions.push(or(ilike(products.title, `%${search}%`), ilike(products.sku, `%${search}%`)));
    }
    if (categoryId) conditions.push(eq(products.categoryId, categoryId));
    if (brandId) conditions.push(eq(products.brandId, brandId));
    const where = and(...conditions);

    const [productRows, countResult] = await Promise.all([
      db.query.products.findMany({
        where, orderBy: [desc(products.createdAt)], limit, offset,
        with: {
          category: { columns: { id: true, name: true } },
          brand: { columns: { id: true, name: true } },
        },
      }),
      db.select({ count: count() }).from(products).where(where),
    ]);

    const totalCount = countResult[0]?.count ?? 0;

    return successResponse({
      products: productRows, totalCount, page, limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    logger.error("Admin get products error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const { title, categoryId, brandId, description, basePrice, comparePrice, images, stock = 0, sku, specifications, isFeatured = false, isActive = true, hasVariants = false, options, variants } = body;

    if (!title || title.trim().length < 2) return errorResponse("Valid title is required (min 2 characters)", 400);
    if (!hasVariants && (!basePrice || basePrice <= 0)) return errorResponse("Valid base price is required", 400);
    if (!images || !Array.isArray(images) || images.length === 0) return errorResponse("At least one image URL is required", 400);

    let slug = slugify(title);
    const existingSlug = await db.query.products.findFirst({ where: eq(products.slug, slug) });
    if (existingSlug) slug = slug + "-" + Date.now();

    // For variant products, denormalize basePrice = min(variant prices), stock = sum(variant stocks)
    let finalBasePrice = basePrice;
    let finalComparePrice = comparePrice;
    let finalStock = stock;

    if (hasVariants && Array.isArray(variants) && variants.length > 0) {
      const activePrices = variants.filter((v: any) => v.isActive !== false).map((v: any) => v.price);
      finalBasePrice = activePrices.length > 0 ? Math.min(...activePrices) : variants[0].price;
      const activeComparePrices = variants.filter((v: any) => v.isActive !== false && v.comparePrice).map((v: any) => v.comparePrice);
      finalComparePrice = activeComparePrices.length > 0 ? Math.min(...activeComparePrices) : null;
      finalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
    }

    const [product] = await db.insert(products).values({
      title: title.trim(), slug, categoryId: categoryId || null, brandId: brandId || null,
      description: description?.trim() || null, basePrice: finalBasePrice, comparePrice: finalComparePrice || null,
      images, stock: finalStock, sku: sku || null, specifications: specifications || null,
      hasVariants, isFeatured, isActive,
    }).returning();

    // Insert options and variants if hasVariants
    if (hasVariants && Array.isArray(options) && Array.isArray(variants)) {
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const [insertedOption] = await db.insert(productOptions).values({
          productId: product.id, name: opt.name, position: i,
        }).returning();

        if (Array.isArray(opt.values)) {
          for (let j = 0; j < opt.values.length; j++) {
            await db.insert(productOptionValues).values({
              optionId: insertedOption.id, value: opt.values[j], position: j,
            });
          }
        }
      }

      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        await db.insert(productVariants).values({
          productId: product.id, sku: v.sku || null, price: v.price,
          comparePrice: v.comparePrice || null, stock: v.stock || 0,
          images: v.images || [], optionValues: v.optionValues || [],
          isActive: v.isActive !== false, position: i,
        });
      }
    }

    return successResponse({ product, message: "Product created successfully" });
  } catch (error) {
    logger.error("Admin create product error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
