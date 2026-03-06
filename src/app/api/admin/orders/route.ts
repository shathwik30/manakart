import { NextRequest } from 'next/server'
import { db } from '@/db'
import { orders } from '@/db/schema'
import { eq, and, desc, count } from 'drizzle-orm'
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
    const offset = (page - 1) * limit

    const conditions: any[] = []
    if (status && ['CREATED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      conditions.push(eq(orders.orderStatus, status as any))
    }
    if (paymentStatus && ['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(paymentStatus)) {
      conditions.push(eq(orders.paymentStatus, paymentStatus as any))
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [orderRows, countResult] = await Promise.all([
      db.query.orders.findMany({
        where, offset, limit, orderBy: [desc(orders.createdAt)],
        columns: {
          id: true, orderNumber: true, total: true, paymentStatus: true,
          orderStatus: true, addressSnapshot: true, createdAt: true,
        },
        with: {
          user: { columns: { id: true, name: true, email: true } },
          items: { columns: { id: true, productTitle: true, size: true, quantity: true, price: true } },
        },
      }),
      db.select({ count: count() }).from(orders).where(where),
    ])

    const totalCount = countResult[0]?.count ?? 0

    return successResponse({
      orders: orderRows,
      pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
    })
  } catch (error) {
    logger.error('Admin get orders error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
