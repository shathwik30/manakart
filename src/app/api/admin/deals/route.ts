import { NextRequest } from "next/server";
import { db } from "@/db";
import { deals, products } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const result = await db.query.deals.findMany({
      orderBy: [asc(deals.position)],
      with: { product: { columns: { id: true, title: true, images: true, basePrice: true } } },
    });
    return successResponse({ deals: result });
  } catch (error) {
    logger.error("Admin get deals error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const { productId, dealPrice, startsAt, endsAt, isActive = true, position = 0 } = body;

    if (!productId) return errorResponse("Product ID is required", 400);
    if (!dealPrice || dealPrice <= 0) return errorResponse("Valid deal price is required", 400);
    if (!startsAt || !endsAt) return errorResponse("Start and end dates are required", 400);

    const product = await db.query.products.findFirst({ where: eq(products.id, productId) });
    if (!product) return errorResponse("Product not found", 404);

    const [deal] = await db.insert(deals).values({
      productId, dealPrice, startsAt: new Date(startsAt), endsAt: new Date(endsAt), isActive, position,
    }).returning();

    const dealWithProduct = await db.query.deals.findFirst({
      where: eq(deals.id, deal.id),
      with: { product: { columns: { id: true, title: true, images: true, basePrice: true } } },
    });

    return successResponse({ deal: dealWithProduct });
  } catch (error) {
    logger.error("Admin create deal error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
