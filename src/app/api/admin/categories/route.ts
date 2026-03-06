import { NextRequest } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, asc, count, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse, slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const result = await db.query.categories.findMany({
      orderBy: [asc(categories.position)],
      with: {
        parent: { columns: { id: true, name: true, slug: true } },
        children: {
          orderBy: [asc(categories.position)],
          columns: { id: true, name: true, slug: true, position: true, isActive: true },
        },
      },
    });

    // Get product counts and children counts
    const allIds = result.map((c) => c.id);
    const productCounts: Record<string, number> = {};
    if (allIds.length > 0) {
      const countRows = await db.select({ categoryId: products.categoryId, count: count() })
        .from(products).where(inArray(products.categoryId, allIds)).groupBy(products.categoryId);
      countRows.forEach((r) => { if (r.categoryId) productCounts[r.categoryId] = r.count; });
    }

    return successResponse({
      categories: result.map((c) => ({
        ...c,
        _count: { products: productCounts[c.id] || 0, children: c.children.length },
      })),
    });
  } catch (error) {
    logger.error("Admin get categories error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const { name, slug: rawSlug, parentId, icon, image, showInNav = false, position = 0, isActive = true } = body;

    if (!name || name.trim().length < 2) return errorResponse("Valid name is required (min 2 characters)", 400);

    let slug = rawSlug ? slugify(rawSlug) : slugify(name);
    const existingSlug = await db.query.categories.findFirst({ where: eq(categories.slug, slug) });
    if (existingSlug) slug = slug + "-" + Date.now();

    if (parentId) {
      const parentExists = await db.query.categories.findFirst({ where: eq(categories.id, parentId) });
      if (!parentExists) return errorResponse("Parent category not found", 404);
    }

    const [category] = await db.insert(categories).values({
      name: name.trim(), slug, parentId: parentId || null, icon: icon || null,
      image: image || null, showInNav, position, isActive,
    }).returning();

    // Re-fetch with parent relation
    const categoryWithParent = await db.query.categories.findFirst({
      where: eq(categories.id, category.id),
      with: { parent: { columns: { id: true, name: true, slug: true } } },
    });

    return successResponse({ category: categoryWithParent });
  } catch (error) {
    logger.error("Admin create category error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
