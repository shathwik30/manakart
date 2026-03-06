import { NextRequest } from "next/server";
import { db } from "@/db";
import { products, productOptions, productOptionValues, productVariants } from "@/db/schema";
import { eq, and, ne, isNull } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse, slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const { id } = await params;

    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id), isNull(products.deletedAt)),
      with: {
        category: { columns: { id: true, name: true, slug: true } },
        brand: { columns: { id: true, name: true, slug: true } },
        options: {
          orderBy: (opt: any, { asc }: any) => [asc(opt.position)],
          with: {
            values: {
              orderBy: (val: any, { asc }: any) => [asc(val.position)],
            },
          },
        },
        variants: {
          orderBy: (v: any, { asc }: any) => [asc(v.position)],
        },
      },
    });
    if (!product) return errorResponse("Product not found", 404);
    return successResponse({ product });
  } catch (error) {
    logger.error("Admin get product error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const { id } = await params;

    const existingProduct = await db.query.products.findFirst({ where: and(eq(products.id, id), isNull(products.deletedAt)) });
    if (!existingProduct) return errorResponse("Product not found", 404);

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (body.title !== undefined) {
      if (body.title.trim().length < 2) return errorResponse("Valid title is required", 400);
      updateData.title = body.title.trim();
      let slug = slugify(body.title);
      const existingSlug = await db.query.products.findFirst({ where: and(eq(products.slug, slug), ne(products.id, id)) });
      if (existingSlug) slug = slug + "-" + Date.now();
      updateData.slug = slug;
    }
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null;
    if (body.brandId !== undefined) updateData.brandId = body.brandId || null;
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.basePrice !== undefined) {
      if (body.basePrice <= 0) return errorResponse("Valid base price is required", 400);
      updateData.basePrice = body.basePrice;
    }
    if (body.comparePrice !== undefined) updateData.comparePrice = body.comparePrice || null;
    if (body.images !== undefined) {
      if (!Array.isArray(body.images) || body.images.length === 0) return errorResponse("At least one image URL is required", 400);
      updateData.images = body.images;
    }
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.sku !== undefined) updateData.sku = body.sku || null;
    if (body.specifications !== undefined) updateData.specifications = body.specifications;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.hasVariants !== undefined) updateData.hasVariants = body.hasVariants;

    // Handle variant data: denormalize price/stock from variants
    if (body.hasVariants && Array.isArray(body.variants) && body.variants.length > 0) {
      const activePrices = body.variants.filter((v: any) => v.isActive !== false).map((v: any) => v.price);
      updateData.basePrice = activePrices.length > 0 ? Math.min(...activePrices) : body.variants[0].price;
      const activeComparePrices = body.variants.filter((v: any) => v.isActive !== false && v.comparePrice).map((v: any) => v.comparePrice);
      updateData.comparePrice = activeComparePrices.length > 0 ? Math.min(...activeComparePrices) : null;
      updateData.stock = body.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
    }

    const [product] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();

    // Rebuild options and variants if provided (delete-all + re-insert strategy)
    if (body.hasVariants !== undefined && Array.isArray(body.options) && Array.isArray(body.variants)) {
      // Delete existing options (cascades to option values)
      await db.delete(productOptions).where(eq(productOptions.productId, id));
      // Delete existing variants
      await db.delete(productVariants).where(eq(productVariants.productId, id));

      if (body.hasVariants) {
        for (let i = 0; i < body.options.length; i++) {
          const opt = body.options[i];
          const [insertedOption] = await db.insert(productOptions).values({
            productId: id, name: opt.name, position: i,
          }).returning();

          if (Array.isArray(opt.values)) {
            for (let j = 0; j < opt.values.length; j++) {
              const val = typeof opt.values[j] === "string" ? opt.values[j] : opt.values[j].value;
              await db.insert(productOptionValues).values({
                optionId: insertedOption.id, value: val, position: j,
              });
            }
          }
        }

        for (let i = 0; i < body.variants.length; i++) {
          const v = body.variants[i];
          await db.insert(productVariants).values({
            productId: id, sku: v.sku || null, price: v.price,
            comparePrice: v.comparePrice || null, stock: v.stock || 0,
            images: v.images || [], optionValues: v.optionValues || [],
            isActive: v.isActive !== false, position: i,
          });
        }
      }
    }

    return successResponse({ product, message: "Product updated successfully" });
  } catch (error) {
    logger.error("Admin update product error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const { id } = await params;

    const product = await db.query.products.findFirst({ where: and(eq(products.id, id), isNull(products.deletedAt)) });
    if (!product) return errorResponse("Product not found", 404);

    await db.update(products).set({ deletedAt: new Date(), isActive: false }).where(eq(products.id, id));
    return successResponse({ message: "Product deleted successfully" });
  } catch (error) {
    logger.error("Admin delete product error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
