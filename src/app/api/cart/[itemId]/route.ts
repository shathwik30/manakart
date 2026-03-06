import { NextRequest } from "next/server";
import { db } from "@/db";
import { cartItems, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    let currentUser = await getCurrentUser();
    const sessionId = request.cookies.get("session_id")?.value || null;

    if (currentUser) {
      const dbUser = await db.query.users.findFirst({ where: eq(users.id, currentUser.userId) });
      if (!dbUser) currentUser = null;
    }

    if (!currentUser && !sessionId) {
      return errorResponse("Cart not found", 404);
    }

    const body = await request.json();
    const { quantity } = body;

    const cartItem = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, itemId),
      with: { cart: true, product: true, variant: true },
    });

    if (!cartItem) {
      return errorResponse("Cart item not found", 404);
    }

    const isOwner = currentUser
      ? cartItem.cart.userId === currentUser.userId
      : cartItem.cart.sessionId === sessionId;

    if (!isOwner) {
      return errorResponse("Unauthorized", 403);
    }

    if (quantity !== undefined) {
      if (quantity < 1) {
        return errorResponse("Quantity must be at least 1", 400);
      }
      // Check variant stock if variant exists, otherwise product stock
      const stockToCheck = (cartItem as any).variant ? (cartItem as any).variant.stock : cartItem.product?.stock;
      if (stockToCheck !== undefined && stockToCheck < quantity) {
        return errorResponse("Insufficient stock", 400);
      }
    }

    const [updatedItem] = await db.update(cartItems)
      .set({ ...(quantity !== undefined && { quantity }) })
      .where(eq(cartItems.id, itemId))
      .returning();

    return successResponse({ item: updatedItem, message: "Cart updated" });
  } catch (error) {
    logger.error("Update cart error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    let currentUser = await getCurrentUser();
    const sessionId = request.cookies.get("session_id")?.value || null;

    if (currentUser) {
      const dbUser = await db.query.users.findFirst({ where: eq(users.id, currentUser.userId) });
      if (!dbUser) currentUser = null;
    }

    if (!currentUser && !sessionId) {
      return errorResponse("Cart not found", 404);
    }

    const cartItem = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, itemId),
      with: { cart: true },
    });

    if (!cartItem) {
      return errorResponse("Cart item not found", 404);
    }

    const isOwner = currentUser
      ? cartItem.cart.userId === currentUser.userId
      : cartItem.cart.sessionId === sessionId;

    if (!isOwner) {
      return errorResponse("Unauthorized", 403);
    }

    await db.delete(cartItems).where(eq(cartItems.id, itemId));
    return successResponse({ message: "Item removed from cart" });
  } catch (error) {
    logger.error("Delete cart item error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
