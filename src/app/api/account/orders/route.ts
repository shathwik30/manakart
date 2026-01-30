import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'


export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return errorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const where: {
      userId: string
      orderStatus?: 'CREATED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
    } = {
      userId: currentUser.userId,
    }

    if (status && ['CREATED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      where.orderStatus = status as 'CREATED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
    }

    logger.info(`Fetching orders for user: ${currentUser.userId}, Status: ${status || 'ALL'}`)
    
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          subtotal: true,
          deliveryCharge: true,
          discount: true,
          total: true,
          paymentStatus: true,
          orderStatus: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              productTitle: true,
              outfitTitle: true,
              size: true,
              quantity: true,
              price: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    logger.info(`Found ${orders.length} orders for user ${currentUser.userId}`)

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
    logger.error('Get orders error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}