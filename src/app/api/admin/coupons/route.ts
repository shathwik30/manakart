import { NextRequest } from 'next/server'
import { db } from '@/db'
import { coupons, orders } from '@/db/schema'
import { eq, desc, count, inArray } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const active = searchParams.get('active')
    const offset = (page - 1) * limit

    const where = active === 'true' ? eq(coupons.isActive, true) : active === 'false' ? eq(coupons.isActive, false) : undefined

    const [couponRows, countResult] = await Promise.all([
      db.query.coupons.findMany({
        where, offset, limit, orderBy: [desc(coupons.createdAt)],
      }),
      db.select({ count: count() }).from(coupons).where(where),
    ])

    const totalCount = countResult[0]?.count ?? 0

    // Get order counts for each coupon in a single query
    const couponIds = couponRows.map(c => c.id)
    const orderCounts: Record<string, number> = {}
    if (couponIds.length > 0) {
      const countRows = await db.select({ couponId: orders.couponId, count: count() })
        .from(orders).where(inArray(orders.couponId, couponIds)).groupBy(orders.couponId)
      for (const row of countRows) {
        if (row.couponId) orderCounts[row.couponId] = row.count
      }
    }

    return successResponse({
      coupons: couponRows.map(c => ({ ...c, _count: { orders: orderCounts[c.id] || 0 } })),
      pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
    })
  } catch (error) {
    logger.error('Admin get coupons error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const { code, discountType, value, minOrderValue, maxDiscount, usageLimit, expiresAt, isActive = true } = body

    if (!code || code.trim().length < 3) return errorResponse('Coupon code must be at least 3 characters', 400)
    if (!discountType || !['FLAT', 'PERCENTAGE'].includes(discountType)) return errorResponse('Valid discount type is required (FLAT or PERCENTAGE)', 400)
    if (!value || value <= 0) return errorResponse('Valid discount value is required', 400)
    if (discountType === 'PERCENTAGE' && value > 100) return errorResponse('Percentage discount cannot exceed 100', 400)

    const normalizedCode = code.toUpperCase().trim()
    const existingCoupon = await db.query.coupons.findFirst({ where: eq(coupons.code, normalizedCode) })
    if (existingCoupon) return errorResponse('Coupon code already exists', 400)

    const [coupon] = await db.insert(coupons).values({
      code: normalizedCode, discountType, value,
      minOrderValue: minOrderValue || null, maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null, expiresAt: expiresAt ? new Date(expiresAt) : null, isActive,
    }).returning()

    return successResponse({ coupon, message: 'Coupon created successfully' })
  } catch (error) {
    logger.error('Admin create coupon error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
