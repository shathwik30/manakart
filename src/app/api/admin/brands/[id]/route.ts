import { NextRequest } from "next/server";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse, slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const { id } = await params;

    const existingBrand = await db.query.brands.findFirst({ where: eq(brands.id, id) });
    if (!existingBrand) return errorResponse("Brand not found", 404);

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (body.name.trim().length < 2) return errorResponse("Valid brand name is required", 400);
      updateData.name = body.name.trim();
      let slug = slugify(body.name);
      const existingSlug = await db.query.brands.findFirst({ where: and(eq(brands.slug, slug), ne(brands.id, id)) });
      if (existingSlug) slug = slug + "-" + Date.now();
      updateData.slug = slug;
    }
    if (body.slug !== undefined) {
      const slug = slugify(body.slug);
      const existingSlug = await db.query.brands.findFirst({ where: and(eq(brands.slug, slug), ne(brands.id, id)) });
      if (existingSlug) return errorResponse("Slug already exists", 400);
      updateData.slug = slug;
    }
    if (body.logo !== undefined) updateData.logo = body.logo || null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const [brand] = await db.update(brands).set(updateData).where(eq(brands.id, id)).returning();
    return successResponse({ brand });
  } catch (error) {
    logger.error("Admin update brand error", { error: error instanceof Error ? error.message : "Unknown error" });
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

    const brand = await db.query.brands.findFirst({ where: eq(brands.id, id) });
    if (!brand) return errorResponse("Brand not found", 404);

    await db.delete(brands).where(eq(brands.id, id));
    return successResponse({ success: true });
  } catch (error) {
    logger.error("Admin delete brand error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
