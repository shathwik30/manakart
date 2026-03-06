import { NextRequest } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, and, ne, asc, count } from "drizzle-orm";
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

    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
      with: {
        parent: { columns: { id: true, name: true, slug: true } },
        children: { orderBy: [asc(categories.position)], columns: { id: true, name: true, slug: true, position: true, isActive: true } },
      },
    });
    if (!category) return errorResponse("Category not found", 404);
    return successResponse({ category });
  } catch (error) {
    logger.error("Admin get category error", { error: error instanceof Error ? error.message : "Unknown error" });
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

    const existingCategory = await db.query.categories.findFirst({ where: eq(categories.id, id) });
    if (!existingCategory) return errorResponse("Category not found", 404);

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (body.name.trim().length < 2) return errorResponse("Valid name is required", 400);
      updateData.name = body.name.trim();
      let slug = slugify(body.name);
      const existingSlug = await db.query.categories.findFirst({ where: and(eq(categories.slug, slug), ne(categories.id, id)) });
      if (existingSlug) slug = slug + "-" + Date.now();
      updateData.slug = slug;
    }
    if (body.slug !== undefined) {
      const slug = slugify(body.slug);
      const existingSlug = await db.query.categories.findFirst({ where: and(eq(categories.slug, slug), ne(categories.id, id)) });
      if (existingSlug) return errorResponse("Slug already exists", 400);
      updateData.slug = slug;
    }
    if (body.parentId !== undefined) {
      if (body.parentId === id) return errorResponse("Category cannot be its own parent", 400);
      if (body.parentId) {
        const parentExists = await db.query.categories.findFirst({ where: eq(categories.id, body.parentId) });
        if (!parentExists) return errorResponse("Parent category not found", 404);
      }
      updateData.parentId = body.parentId || null;
    }
    if (body.icon !== undefined) updateData.icon = body.icon || null;
    if (body.image !== undefined) updateData.image = body.image || null;
    if (body.showInNav !== undefined) updateData.showInNav = body.showInNav;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const [category] = await db.update(categories).set(updateData).where(eq(categories.id, id)).returning();

    const categoryWithParent = await db.query.categories.findFirst({
      where: eq(categories.id, category.id),
      with: { parent: { columns: { id: true, name: true, slug: true } } },
    });

    return successResponse({ category: categoryWithParent });
  } catch (error) {
    logger.error("Admin update category error", { error: error instanceof Error ? error.message : "Unknown error" });
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

    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
      with: { children: true },
    });
    if (!category) return errorResponse("Category not found", 404);

    // Check for children
    if (category.children.length > 0) return errorResponse("Cannot delete category with subcategories. Remove children first.", 400);

    // Check for products
    const productCount = await db.select({ count: count() }).from(products).where(eq(products.categoryId, id));

    await db.delete(categories).where(eq(categories.id, id));
    return successResponse({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    logger.error("Admin delete category error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
