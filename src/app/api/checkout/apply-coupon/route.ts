import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse, calculateDiscount, formatPrice } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, subtotal } = body

    if (!code) {
      return errorResponse('Coupon code is required', 400)
    }

    if (!subtotal || subtotal <= 0) {
      return errorResponse('Valid subtotal is required', 400)
    }

    
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (!coupon) {
      return errorResponse('Invalid coupon code', 404)
    }

    if (!coupon.isActive) {
      return errorResponse('This coupon is no longer active', 400)
    }

    
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return errorResponse('This coupon has expired', 400)
    }

    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return errorResponse('This coupon has reached its usage limit', 400)
    }

    
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return errorResponse(
        `Minimum order value of ${formatPrice(coupon.minOrderValue)} required`,
        400
      )
    }

    
    const discount = calculateDiscount(
      subtotal,
      coupon.discountType,
      coupon.value,
      coupon.maxDiscount
    )

    return successResponse({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
      },
      discount,
      message: `Coupon applied! You save ${formatPrice(discount)}`,
    })
  } catch (error) {
    logger.error('Apply coupon error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}