import { NextRequest } from 'next/server'
import { db } from '@/db'
import { coupons, orders } from '@/db/schema'
import { eq, and, ne, count } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params

    const coupon = await db.query.coupons.findFirst({ where: eq(coupons.id, id) })
    if (!coupon) return errorResponse('Coupon not found', 404)

    const [orderCount] = await db.select({ count: count() }).from(orders).where(eq(orders.couponId, id))

    return successResponse({ coupon: { ...coupon, _count: { orders: orderCount?.count ?? 0 } } })
  } catch (error) {
    logger.error('Admin get coupon error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params

    const existingCoupon = await db.query.coupons.findFirst({ where: eq(coupons.id, id) })
    if (!existingCoupon) return errorResponse('Coupon not found', 404)

    const body = await request.json()
    const { code, discountType, value, minOrderValue, maxDiscount, usageLimit, expiresAt, isActive } = body
    const updateData: Record<string, unknown> = {}

    if (code !== undefined) {
      if (!code || code.trim().length < 3) return errorResponse('Coupon code must be at least 3 characters', 400)
      const normalizedCode = code.toUpperCase().trim()
      const existingCode = await db.query.coupons.findFirst({ where: and(eq(coupons.code, normalizedCode), ne(coupons.id, id)) })
      if (existingCode) return errorResponse('Coupon code already exists', 400)
      updateData.code = normalizedCode
    }
    if (discountType !== undefined) {
      if (!['FLAT', 'PERCENTAGE'].includes(discountType)) return errorResponse('Valid discount type is required', 400)
      updateData.discountType = discountType
    }
    if (value !== undefined) {
      if (value <= 0) return errorResponse('Valid discount value is required', 400)
      const type = discountType || existingCoupon.discountType
      if (type === 'PERCENTAGE' && value > 100) return errorResponse('Percentage discount cannot exceed 100', 400)
      updateData.value = value
    }
    if (minOrderValue !== undefined) updateData.minOrderValue = minOrderValue || null
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount || null
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit || null
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
    if (isActive !== undefined) updateData.isActive = isActive

    const [coupon] = await db.update(coupons).set(updateData).where(eq(coupons.id, id)).returning()
    return successResponse({ coupon, message: 'Coupon updated successfully' })
  } catch (error) {
    logger.error('Admin update coupon error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params

    const coupon = await db.query.coupons.findFirst({ where: eq(coupons.id, id) })
    if (!coupon) return errorResponse('Coupon not found', 404)

    const [orderCount] = await db.select({ count: count() }).from(orders).where(eq(orders.couponId, id))

    if ((orderCount?.count ?? 0) > 0) {
      await db.update(coupons).set({ isActive: false }).where(eq(coupons.id, id))
      return successResponse({ message: 'Coupon deactivated (has order history)' })
    }

    await db.delete(coupons).where(eq(coupons.id, id))
    return successResponse({ message: 'Coupon deleted successfully' })
  } catch (error) {
    logger.error('Admin delete coupon error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
