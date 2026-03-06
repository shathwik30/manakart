import { NextRequest } from 'next/server'
import { db } from '@/db'
import { orders } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        user: { columns: { id: true, name: true, email: true, phone: true } },
        coupon: { columns: { code: true, discountType: true, value: true } },
        items: { with: { product: { columns: { id: true, title: true, images: true } } } },
      },
    })
    if (!order) return errorResponse('Order not found', 404)
    return successResponse({ order })
  } catch (error) {
    logger.error('Admin get order error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params

    const existingOrder = await db.query.orders.findFirst({ where: eq(orders.id, id) })
    if (!existingOrder) return errorResponse('Order not found', 404)

    const body = await request.json()
    const { orderStatus, paymentStatus } = body
    const updateData: Record<string, any> = {}

    // Valid order status transitions
    const validTransitions: Record<string, string[]> = {
      CREATED: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    }

    if (orderStatus !== undefined) {
      if (!['CREATED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(orderStatus)) return errorResponse('Invalid order status', 400)
      const allowed = validTransitions[existingOrder.orderStatus] || []
      if (!allowed.includes(orderStatus)) {
        return errorResponse(`Cannot transition from ${existingOrder.orderStatus} to ${orderStatus}`, 400)
      }
      updateData.orderStatus = orderStatus
    }
    if (paymentStatus !== undefined) {
      if (!['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(paymentStatus)) return errorResponse('Invalid payment status', 400)
      updateData.paymentStatus = paymentStatus
    }
    if (Object.keys(updateData).length === 0) return errorResponse('No valid fields to update', 400)

    const [order] = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning()
    return successResponse({ order, message: 'Order updated successfully' })
  } catch (error) {
    logger.error('Admin update order error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
