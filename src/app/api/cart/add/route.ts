import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { carts, cartItems, products, productVariants, users } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { successResponse, errorResponse, generateSessionId } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    let currentUser = await getCurrentUser();
    let sessionId = request.cookies.get("session_id")?.value || null;

    // Verify user still exists in DB (token may reference a deleted user after re-seed)
    if (currentUser) {
      const dbUser = await db.query.users.findFirst({ where: eq(users.id, currentUser.userId) });
      if (!dbUser) currentUser = null;
    }

    const body = await request.json();
    const { productId, variantId, quantity = 1 } = body;

    if (!productId) {
      return errorResponse("productId is required", 400);
    }

    const product = await db.query.products.findFirst({
      where: and(eq(products.id, productId), eq(products.isActive, true), isNull(products.deletedAt)),
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    // Variant validation
    let variant = null;
    let priceSnapshot = product.basePrice;
    let stockToCheck = product.stock;

    if (product.hasVariants) {
      if (!variantId) {
        return errorResponse("Please select a variant", 400);
      }
      variant = await db.query.productVariants.findFirst({
        where: and(eq(productVariants.id, variantId), eq(productVariants.productId, productId)),
      });
      if (!variant || !variant.isActive) {
        return errorResponse("Variant not found or unavailable", 404);
      }
      priceSnapshot = variant.price;
      stockToCheck = variant.stock;
    }

    if (stockToCheck < quantity) {
      return errorResponse("Insufficient stock", 400);
    }

    let cart = currentUser
      ? await db.query.carts.findFirst({ where: eq(carts.userId, currentUser.userId) })
      : sessionId
        ? await db.query.carts.findFirst({ where: eq(carts.sessionId, sessionId) })
        : null;

    if (!currentUser && !sessionId) {
      sessionId = generateSessionId();
    }

    if (!cart) {
      try {
        const [newCart] = await db.insert(carts).values({
          userId: currentUser?.userId || null,
          sessionId: currentUser ? null : (sessionId || null),
        }).returning();
        cart = newCart;
      } catch {
        // Unique constraint — cart was created concurrently, re-fetch
        cart = currentUser
          ? await db.query.carts.findFirst({ where: eq(carts.userId, currentUser.userId) })
          : sessionId
            ? await db.query.carts.findFirst({ where: eq(carts.sessionId, sessionId) })
            : null;
        if (!cart) return errorResponse("Failed to create cart", 500);
      }
    }

    // Look up existing item by (cartId, productId, variantId)
    const allCartItems = await db.query.cartItems.findMany({
      where: and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)),
    });
    const existingItem = allCartItems.find((item) =>
      (item.variantId || null) === (variantId || null)
    );

    if (existingItem) {
      await db.update(cartItems).set({ quantity: existingItem.quantity + quantity }).where(eq(cartItems.id, existingItem.id));
    } else {
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
        priceSnapshot,
      });
    }

    await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cart.id));

    const response = NextResponse.json(
      { success: true, data: { message: "Item added to cart" } },
      { status: 200 }
    );

    if (!currentUser && sessionId) {
      response.cookies.set("session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    logger.error("Add to cart error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
