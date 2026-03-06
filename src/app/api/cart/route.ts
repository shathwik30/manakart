import { NextRequest } from "next/server";
import { db } from "@/db";
import { carts, cartItems, products, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    let currentUser = await getCurrentUser();
    const sessionId = request.cookies.get("session_id")?.value || null;

    // Verify user still exists in DB
    if (currentUser) {
      const dbUser = await db.query.users.findFirst({ where: eq(users.id, currentUser.userId) });
      if (!dbUser) currentUser = null;
    }

    if (!currentUser && !sessionId) {
      return successResponse({ cart: null, items: [], subtotal: 0, itemCount: 0 });
    }

    const cart = await db.query.carts.findFirst({
      where: currentUser
        ? eq(carts.userId, currentUser.userId)
        : eq(carts.sessionId, sessionId!),
      with: {
        items: {
          with: {
            product: {
              columns: {
                id: true, title: true, slug: true, basePrice: true,
                comparePrice: true, images: true, stock: true, isActive: true, hasVariants: true,
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      return successResponse({ cart: null, items: [], subtotal: 0, itemCount: 0 });
    }

    const transformedItems = cart.items.map((item) => ({
      id: item.id,
      product: item.product,
      variant: item.variant || null,
      quantity: item.quantity,
      price: item.priceSnapshot,
    }));

    const subtotal = cart.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return successResponse({
      cart: { id: cart.id, userId: cart.userId, sessionId: cart.sessionId },
      items: transformedItems,
      subtotal,
      itemCount,
    });
  } catch (error) {
    logger.error("Get cart error", { error: String(error) });
    return errorResponse("Something went wrong", 500);
  }
}
