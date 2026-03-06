import { NextRequest } from "next/server";
import { db } from "@/db";
import { brands, products } from "@/db/schema";
import { eq, asc, count, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse, slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const result = await db.query.brands.findMany({ orderBy: [asc(brands.name)] });

    const brandIds = result.map((b) => b.id);
    const productCounts: Record<string, number> = {};
    if (brandIds.length > 0) {
      const countRows = await db.select({ brandId: products.brandId, count: count() })
        .from(products).where(inArray(products.brandId, brandIds)).groupBy(products.brandId);
      countRows.forEach((r) => { if (r.brandId) productCounts[r.brandId] = r.count; });
    }

    return successResponse({
      brands: result.map((b) => ({ ...b, _count: { products: productCounts[b.id] || 0 } })),
    });
  } catch (error) {
    logger.error("Admin get brands error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const { name, slug: rawSlug, logo, isActive = true } = body;

    if (!name || name.trim().length < 2) return errorResponse("Valid brand name is required (min 2 characters)", 400);

    let slug = rawSlug ? slugify(rawSlug) : slugify(name);
    const existingSlug = await db.query.brands.findFirst({ where: eq(brands.slug, slug) });
    if (existingSlug) slug = slug + "-" + Date.now();

    const [brand] = await db.insert(brands).values({
      name: name.trim(), slug, logo: logo || null, isActive,
    }).returning();

    return successResponse({ brand });
  } catch (error) {
    logger.error("Admin create brand error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
