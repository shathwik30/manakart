import { NextRequest } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const { id } = await params;

    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, id),
      with: {
        product: { columns: { id: true, title: true, slug: true } },
        user: { columns: { id: true, name: true, email: true } },
      },
    });
    if (!review) return errorResponse("Review not found", 404);
    return successResponse({ review });
  } catch (error) {
    logger.error("Admin get review error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const { id } = await params;

    const existing = await db.query.reviews.findFirst({ where: eq(reviews.id, id) });
    if (!existing) return errorResponse("Review not found", 404);

    const body = await request.json();
    const updateData: Record<string, any> = {};
    if (body.isApproved !== undefined) updateData.isApproved = body.isApproved;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.adminReply !== undefined) updateData.adminReply = body.adminReply || null;

    const [review] = await db.update(reviews).set(updateData).where(eq(reviews.id, id)).returning();
    return successResponse({ review, message: "Review updated successfully" });
  } catch (error) {
    logger.error("Admin update review error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const { id } = await params;

    await db.delete(reviews).where(eq(reviews.id, id));
    return successResponse({ message: "Review deleted successfully" });
  } catch (error) {
    logger.error("Admin delete review error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
