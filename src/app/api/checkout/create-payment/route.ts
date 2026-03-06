import { NextRequest } from "next/server";
import { db } from "@/db";
import { carts, coupons } from "@/db/schema";
import { eq, and, or, isNull } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/razorpay";
import { successResponse, errorResponse, generateOrderNumber } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return errorResponse("Please verify your email first", 401);
    }

    const body = await request.json();
    const { cartId, address, couponCode, subtotal, deliveryCharge, discount, total } = body;

    if (!cartId || !address || total === undefined) {
      return errorResponse("Invalid checkout data", 400);
    }

    const cart = await db.query.carts.findFirst({
      where: and(
        eq(carts.id, cartId),
        or(eq(carts.userId, currentUser.userId), isNull(carts.userId))
      ),
      with: { items: { with: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return errorResponse("Cart not found or empty", 400);
    }

    let couponId = null;
    if (couponCode) {
      const coupon = await db.query.coupons.findFirst({
        where: and(eq(coupons.code, couponCode.toUpperCase().trim()), eq(coupons.isActive, true)),
      });
      if (coupon) couponId = coupon.id;
    }

    const orderNumber = generateOrderNumber();
    const razorpayOrder = await createRazorpayOrder({
      amount: total, currency: "INR", receipt: orderNumber,
      notes: { userId: currentUser.userId, cartId: cart.id },
    });

    return successResponse({
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: total, currency: "INR", orderNumber,
      checkoutData: { cartId, userId: currentUser.userId, address, couponId, subtotal, deliveryCharge, discount, total },
    });
  } catch (error) {
    logger.error("Create payment error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
