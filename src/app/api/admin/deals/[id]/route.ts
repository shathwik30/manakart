import { NextRequest } from "next/server";
import { db } from "@/db";
import { deals, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const { id } = await params;

    const deal = await db.query.deals.findFirst({
      where: eq(deals.id, id),
      with: { product: { columns: { id: true, title: true, images: true, basePrice: true } } },
    });
    if (!deal) return errorResponse("Deal not found", 404);
    return successResponse({ deal });
  } catch (error) {
    logger.error("Admin get deal error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const { id } = await params;

    const existingDeal = await db.query.deals.findFirst({ where: eq(deals.id, id) });
    if (!existingDeal) return errorResponse("Deal not found", 404);

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.productId !== undefined) {
      const product = await db.query.products.findFirst({ where: eq(products.id, body.productId) });
      if (!product) return errorResponse("Product not found", 404);
      updateData.productId = body.productId;
    }
    if (body.dealPrice !== undefined) {
      if (body.dealPrice <= 0) return errorResponse("Valid deal price is required", 400);
      updateData.dealPrice = body.dealPrice;
    }
    if (body.startsAt !== undefined) updateData.startsAt = new Date(body.startsAt);
    if (body.endsAt !== undefined) updateData.endsAt = new Date(body.endsAt);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.position !== undefined) updateData.position = body.position;

    await db.update(deals).set(updateData).where(eq(deals.id, id));

    const deal = await db.query.deals.findFirst({
      where: eq(deals.id, id),
      with: { product: { columns: { id: true, title: true, images: true, basePrice: true } } },
    });
    return successResponse({ deal });
  } catch (error) {
    logger.error("Admin update deal error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const { id } = await params;

    const deal = await db.query.deals.findFirst({ where: eq(deals.id, id) });
    if (!deal) return errorResponse("Deal not found", 404);

    await db.delete(deals).where(eq(deals.id, id));
    return successResponse({ success: true, message: "Deal deleted successfully" });
  } catch (error) {
    logger.error("Admin delete deal error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
