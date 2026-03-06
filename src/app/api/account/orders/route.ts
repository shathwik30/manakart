import { NextRequest } from 'next/server'
import { db } from '@/db'
import { orders } from '@/db/schema'
import { eq, and, desc, count } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return errorResponse('Unauthorized', 401)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const offset = (page - 1) * limit

    const conditions: any[] = [eq(orders.userId, currentUser.userId)]
    if (status && ['CREATED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      conditions.push(eq(orders.orderStatus, status as any))
    }
    const where = and(...conditions)

    logger.info(`Fetching orders for user: ${currentUser.userId}, Status: ${status || 'ALL'}`)

    const [orderRows, countResult] = await Promise.all([
      db.query.orders.findMany({
        where,
        offset,
        limit,
        orderBy: [desc(orders.createdAt)],
        columns: {
          id: true, orderNumber: true, subtotal: true, deliveryCharge: true,
          discount: true, total: true, paymentStatus: true, orderStatus: true, createdAt: true,
        },
        with: {
          items: {
            columns: { id: true, productTitle: true, size: true, quantity: true, price: true },
          },
        },
      }),
      db.select({ count: count() }).from(orders).where(where),
    ])

    const totalCount = countResult[0]?.count ?? 0
    logger.info(`Found ${orderRows.length} orders for user ${currentUser.userId}`)

    return successResponse({
      orders: orderRows,
      pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
    })
  } catch (error) {
    logger.error('Get orders error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
