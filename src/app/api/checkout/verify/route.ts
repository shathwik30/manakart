
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { successResponse, errorResponse, generateOrderNumber } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return errorResponse('Unauthorized', 401)
    }
    const body = await request.json()
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      checkoutData,
    } = body
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    )
    if (!isValidSignature) {
      return errorResponse('Payment verification failed', 400)
    }
    const { cartId, address, couponId, subtotal, deliveryCharge, discount, total } =
      checkoutData
    const cart = await prisma.cart.findFirst({
      where: {
        id: cartId,
        userId: currentUser.userId,
      },
      include: {
        items: {
          include: {
            product: true,
            outfit: {
              include: {
                items: {
                  select: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    if (!cart || cart.items.length === 0) {
      return errorResponse('Cart not found', 400)
    }
    const orderNumber = generateOrderNumber()
    const order = await prisma.$transaction(async (tx: any) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: currentUser.userId,
          subtotal,
          deliveryCharge,
          discount,
          total,
          couponId,
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
          paymentId: razorpayPaymentId,
          paymentMethod: 'razorpay',
          addressSnapshot: address,
        },
      })
      for (const cartItem of cart.items) {
        if (cartItem.isBundle && cartItem.outfit) {
          const selectedSizes = cartItem.selectedSizes as Record<string, string>
          for (const outfitItem of cartItem.outfit.items) {
            const size = selectedSizes[outfitItem.product.id]
            await tx.orderItem.create({
              data: {
                orderId: newOrder.id,
                productId: outfitItem.product.id,
                outfitId: cartItem.outfitId,
                outfitTitle: cartItem.outfit.title,
                productTitle: outfitItem.product.title,
                size,
                quantity: cartItem.quantity,
                price: Math.floor(cartItem.priceSnapshot / cartItem.outfit.items.length),
              },
            })
            const currentStock = outfitItem.product.stockPerSize as Record<string, number>
            currentStock[size] = Math.max(0, (currentStock[size] || 0) - cartItem.quantity)
            await tx.product.update({
              where: { id: outfitItem.product.id },
              data: { stockPerSize: currentStock },
            })
          }
        } else if (cartItem.product) {
          const selectedSizes = cartItem.selectedSizes as Record<string, string>
          const size = selectedSizes.size
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: cartItem.productId!,
              productTitle: cartItem.product.title,
              size,
              quantity: cartItem.quantity,
              price: cartItem.priceSnapshot,
            },
          })
          const currentStock = cartItem.product.stockPerSize as Record<string, number>
          currentStock[size] = Math.max(0, (currentStock[size] || 0) - cartItem.quantity)
          await tx.product.update({
            where: { id: cartItem.productId! },
            data: { stockPerSize: currentStock },
          })
        }
      }
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        })
      }
      const existingAddress = await tx.address.findFirst({
        where: {
          userId: currentUser.userId,
          street: address.street,
          pincode: address.pincode,
        },
      })
      if (!existingAddress) {
        await tx.address.create({
          data: {
            userId: currentUser.userId,
            ...address,
          },
        })
      }
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      })
      return newOrder
    })
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    })
    await sendOrderConfirmationEmail(
      address.email,
      order.orderNumber,
      order.total,
      orderItems.map((item: any) => ({
        title: item.productTitle,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      }))
    )
    return successResponse({
      message: 'Order placed successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
      },
    })
  } catch (error) {
    logger.error('Verify payment error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

