
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { createRazorpayOrder } from '@/lib/razorpay'
import { successResponse, errorResponse, generateOrderNumber } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return errorResponse('Please verify your email first', 401)
    }
    const body = await request.json()
    const { cartId, address, couponCode, subtotal, deliveryCharge, discount, total } = body
    if (!cartId || !address || total === undefined) {
      return errorResponse('Invalid checkout data', 400)
    }
    const cart = await prisma.cart.findFirst({
      where: {
        id: cartId,
        OR: [
          { userId: currentUser.userId },
          { userId: null }
        ]
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
      return errorResponse('Cart not found or empty', 400)
    }
    let couponId = null
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim(), isActive: true },
      })
      if (coupon) {
        couponId = coupon.id
      }
    }
    const orderNumber = generateOrderNumber()
    const razorpayOrder = await createRazorpayOrder({
      amount: total, 
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        userId: currentUser.userId,
        cartId: cart.id,
      },
    })
    return successResponse({
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: total,
      currency: 'INR',
      orderNumber,
      checkoutData: {
        cartId,
        userId: currentUser.userId,
        address,
        couponId,
        subtotal,
        deliveryCharge,
        discount,
        total,
      },
    })
  } catch (error) {
    logger.error('Create payment error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

