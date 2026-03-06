import { NextRequest } from "next/server";
import { db } from "@/db";
import { carts, orders, orderItems, products, coupons, addresses, cartItems, productVariants } from "@/db/schema";
import { eq, and, or, isNull, sql, gte } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { successResponse, errorResponse, generateOrderNumber } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return errorResponse("Unauthorized", 401);

    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, checkoutData } = body;

    const isValidSignature = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValidSignature) return errorResponse("Payment verification failed", 400);

    // Idempotency: check if order already exists for this payment
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.paymentId, razorpayPaymentId),
    });
    if (existingOrder) {
      return successResponse({
        message: "Order already placed",
        order: {
          id: existingOrder.id, orderNumber: existingOrder.orderNumber,
          total: existingOrder.total, status: existingOrder.orderStatus, paymentStatus: existingOrder.paymentStatus,
        },
      });
    }

    const { cartId, address, couponId, subtotal, deliveryCharge, discount, total } = checkoutData;

    const cart = await db.query.carts.findFirst({
      where: and(eq(carts.id, cartId), or(eq(carts.userId, currentUser.userId), isNull(carts.userId))),
      with: { items: { with: { product: true, variant: true } } },
    });

    if (!cart || cart.items.length === 0) return errorResponse("Cart not found", 400);

    // Re-validate coupon before creating order
    if (couponId) {
      const coupon = await db.query.coupons.findFirst({ where: eq(coupons.id, couponId) });
      if (!coupon || !coupon.isActive) return errorResponse("Coupon is no longer valid", 400);
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return errorResponse("Coupon has expired", 400);
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return errorResponse("Coupon usage limit reached", 400);
    }

    const orderNumber = generateOrderNumber();

    // Create order (no transaction available with neon-http, run sequentially)
    const [newOrder] = await db.insert(orders).values({
      orderNumber, userId: currentUser.userId, subtotal, deliveryCharge, discount, total,
      couponId, paymentStatus: "PAID", orderStatus: "CONFIRMED",
      paymentId: razorpayPaymentId, paymentMethod: "razorpay", addressSnapshot: address,
    }).returning();

    for (const cartItem of cart.items) {
      if (cartItem.product) {
        const variant = (cartItem as any).variant;
        const variantSnapshot = variant ? {
          sku: variant.sku,
          optionValues: variant.optionValues,
        } : null;
        const productImage = variant?.images?.[0] || cartItem.product.images?.[0] || null;

        await db.insert(orderItems).values({
          orderId: newOrder.id, productId: cartItem.productId,
          productTitle: cartItem.product.title, quantity: cartItem.quantity, price: cartItem.priceSnapshot,
          variantId: cartItem.variantId || null,
          variantSnapshot,
          productImage,
        });

        // Stock decrement: target variant when present, always update product-level aggregate
        if (cartItem.variantId && variant) {
          const variantStockResult = await db.update(productVariants)
            .set({ stock: sql`${productVariants.stock} - ${cartItem.quantity}` })
            .where(and(
              eq(productVariants.id, cartItem.variantId),
              gte(productVariants.stock, cartItem.quantity)
            ))
            .returning({ id: productVariants.id, stock: productVariants.stock });
          if (variantStockResult.length === 0) {
            logger.warn("Variant stock insufficient during order", { variantId: cartItem.variantId, quantity: cartItem.quantity });
          }
        }

        // Always update product-level stock
        const stockResult = await db.update(products)
          .set({ stock: sql`${products.stock} - ${cartItem.quantity}` })
          .where(and(
            eq(products.id, cartItem.productId),
            gte(products.stock, cartItem.quantity)
          ))
          .returning({ id: products.id, stock: products.stock });
        if (stockResult.length === 0) {
          logger.warn("Stock insufficient during order", { productId: cartItem.productId, quantity: cartItem.quantity });
        }
      }
    }

    if (couponId) {
      await db.update(coupons)
        .set({ usedCount: sql`${coupons.usedCount} + 1` })
        .where(eq(coupons.id, couponId));
    }

    const existingAddress = await db.query.addresses.findFirst({
      where: and(
        eq(addresses.userId, currentUser.userId),
        eq(addresses.street, address.street),
        eq(addresses.pincode, address.pincode)
      ),
    });

    if (!existingAddress) {
      await db.insert(addresses).values({ userId: currentUser.userId, ...address });
    }

    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    const createdOrderItems = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, newOrder.id),
    });

    await sendOrderConfirmationEmail(
      address.email, newOrder.orderNumber, newOrder.total,
      createdOrderItems.map((item: any) => {
        const vs = item.variantSnapshot as any;
        const variantLabel = vs?.optionValues?.length > 0
          ? vs.optionValues.map((ov: any) => `${ov.optionName}: ${ov.valueName}`).join(", ")
          : item.size || "N/A";
        return {
          title: item.productTitle, size: variantLabel, quantity: item.quantity, price: item.price,
        };
      })
    );

    return successResponse({
      message: "Order placed successfully",
      order: {
        id: newOrder.id, orderNumber: newOrder.orderNumber,
        total: newOrder.total, status: newOrder.orderStatus, paymentStatus: newOrder.paymentStatus,
      },
    });
  } catch (error) {
    logger.error("Verify payment error", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("Something went wrong", 500);
  }
}
