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
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        coupon: {
          select: {
            code: true,
            discountType: true,
            value: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
      },
    })
    if (!order) {
      return errorResponse('Order not found', 404)
    }
    return successResponse({ order })
  } catch (error) {
    logger.error('Admin get order error', { error: error instanceof Error ? error.message : 'Unknown error' })
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
    const existingOrder = await prisma.order.findUnique({ where: { id } })
    if (!existingOrder) {
      return errorResponse('Order not found', 404)
    }
    const body = await request.json()
    const { orderStatus, paymentStatus } = body
    const updateData: {
      orderStatus?: 'CREATED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
      paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
    } = {}
    if (orderStatus !== undefined) {
      if (!['CREATED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(orderStatus)) {
        return errorResponse('Invalid order status', 400)
      }
      updateData.orderStatus = orderStatus
    }
    if (paymentStatus !== undefined) {
      if (!['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(paymentStatus)) {
        return errorResponse('Invalid payment status', 400)
      }
      updateData.paymentStatus = paymentStatus
    }
    if (Object.keys(updateData).length === 0) {
      return errorResponse('No valid fields to update', 400)
    }
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    })
    return successResponse({ order, message: 'Order updated successfully' })
  } catch (error) {
    logger.error('Admin update order error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}