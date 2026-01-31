
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    })
    if (!coupon) {
      return errorResponse('Coupon not found', 404)
    }
    return successResponse({ coupon })
  } catch (error) {
    logger.error('Admin get coupon error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params
    const existingCoupon = await prisma.coupon.findUnique({ where: { id } })
    if (!existingCoupon) {
      return errorResponse('Coupon not found', 404)
    }
    const body = await request.json()
    const {
      code,
      discountType,
      value,
      minOrderValue,
      maxDiscount,
      usageLimit,
      expiresAt,
      isActive,
    } = body
    const updateData: Record<string, unknown> = {}
    if (code !== undefined) {
      if (!code || code.trim().length < 3) {
        return errorResponse('Coupon code must be at least 3 characters', 400)
      }
      const normalizedCode = code.toUpperCase().trim()
      const existingCode = await prisma.coupon.findFirst({
        where: { code: normalizedCode, id: { not: id } },
      })
      if (existingCode) {
        return errorResponse('Coupon code already exists', 400)
      }
      updateData.code = normalizedCode
    }
    if (discountType !== undefined) {
      if (!['FLAT', 'PERCENTAGE'].includes(discountType)) {
        return errorResponse('Valid discount type is required', 400)
      }
      updateData.discountType = discountType
    }
    if (value !== undefined) {
      if (value <= 0) {
        return errorResponse('Valid discount value is required', 400)
      }
      const type = discountType || existingCoupon.discountType
      if (type === 'PERCENTAGE' && value > 100) {
        return errorResponse('Percentage discount cannot exceed 100', 400)
      }
      updateData.value = value
    }
    if (minOrderValue !== undefined) {
      updateData.minOrderValue = minOrderValue || null
    }
    if (maxDiscount !== undefined) {
      updateData.maxDiscount = maxDiscount || null
    }
    if (usageLimit !== undefined) {
      updateData.usageLimit = usageLimit || null
    }
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }
    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    })
    return successResponse({ coupon, message: 'Coupon updated successfully' })
  } catch (error) {
    logger.error('Admin update coupon error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    })
    if (!coupon) {
      return errorResponse('Coupon not found', 404)
    }
    if (coupon._count.orders > 0) {
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      })
      return successResponse({ message: 'Coupon deactivated (has order history)' })
    }
    await prisma.coupon.delete({
      where: { id },
    })
    return successResponse({ message: 'Coupon deleted successfully' })
  } catch (error) {
    logger.error('Admin delete coupon error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

