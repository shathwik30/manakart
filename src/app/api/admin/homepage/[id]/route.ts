import { NextRequest } from "next/server";
import { db } from "@/db";
import { homepageSections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const { id } = await params;

    const existingSection = await db.query.homepageSections.findFirst({ where: eq(homepageSections.id, id) });
    if (!existingSection) return errorResponse("Homepage section not found", 404);

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (body.title.trim().length < 2) return errorResponse("Valid title is required", 400);
      updateData.title = body.title.trim();
    }
    if (body.type !== undefined) {
      if (body.type.trim().length === 0) return errorResponse("Section type is required", 400);
      updateData.type = body.type.trim();
    }
    if (body.config !== undefined) updateData.config = body.config;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const [section] = await db.update(homepageSections).set(updateData).where(eq(homepageSections.id, id)).returning();
    return successResponse({ section });
  } catch (error) {
    logger.error("Admin update homepage section error", { error: error instanceof Error ? error.message : "Unknown error" });
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

    const section = await db.query.homepageSections.findFirst({ where: eq(homepageSections.id, id) });
    if (!section) return errorResponse("Homepage section not found", 404);

    await db.delete(homepageSections).where(eq(homepageSections.id, id));
    return successResponse({ success: true });
  } catch (error) {
    logger.error("Admin delete homepage section error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
