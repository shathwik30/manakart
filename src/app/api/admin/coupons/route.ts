import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
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

    const skip = (page - 1) * limit

    const where: { isActive?: boolean } = {}

    if (active === 'true') {
      where.isActive = true
    } else if (active === 'false') {
      where.isActive = false
    }

    const [coupons, totalCount] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          code: true,
          discountType: true,
          value: true,
          minOrderValue: true,
          maxDiscount: true,
          usageLimit: true,
          usedCount: true,
          expiresAt: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.coupon.count({ where }),
    ])

    return successResponse({
      coupons,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
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
    const {
      code,
      discountType,
      value,
      minOrderValue,
      maxDiscount,
      usageLimit,
      expiresAt,
      isActive = true,
    } = body

    
    if (!code || code.trim().length < 3) {
      return errorResponse('Coupon code must be at least 3 characters', 400)
    }

    if (!discountType || !['FLAT', 'PERCENTAGE'].includes(discountType)) {
      return errorResponse('Valid discount type is required (FLAT or PERCENTAGE)', 400)
    }

    if (!value || value <= 0) {
      return errorResponse('Valid discount value is required', 400)
    }

    if (discountType === 'PERCENTAGE' && value > 100) {
      return errorResponse('Percentage discount cannot exceed 100', 400)
    }

    const normalizedCode = code.toUpperCase().trim()

    
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    })

    if (existingCoupon) {
      return errorResponse('Coupon code already exists', 400)
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: normalizedCode,
        discountType,
        value,
        minOrderValue: minOrderValue || null,
        maxDiscount: maxDiscount || null,
        usageLimit: usageLimit || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive,
      },
    })

    return successResponse({ coupon, message: 'Coupon created successfully' })
  } catch (error) {
    logger.error('Admin create coupon error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}