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
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')

    const skip = (page - 1) * limit

    const where: {
      orderStatus?: 'CREATED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
      paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
    } = {}

    if (status && ['CREATED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      where.orderStatus = status as typeof where.orderStatus
    }

    if (paymentStatus && ['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(paymentStatus)) {
      where.paymentStatus = paymentStatus as typeof where.paymentStatus
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          paymentStatus: true,
          orderStatus: true,
          addressSnapshot: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            select: {
              id: true,
              productTitle: true,
              size: true,
              quantity: true,
              price: true,
            }
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    return successResponse({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    logger.error('Admin get orders error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}