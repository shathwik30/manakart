import { NextRequest } from 'next/server'
import { db } from '@/db'
import { orders } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()
    if (!currentUser) return errorResponse('Unauthorized', 401)

    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.userId, currentUser.userId)),
      columns: {
        id: true, orderNumber: true, subtotal: true, deliveryCharge: true,
        discount: true, total: true, paymentStatus: true, orderStatus: true,
        paymentId: true, paymentMethod: true, addressSnapshot: true, createdAt: true, updatedAt: true,
      },
      with: {
        coupon: { columns: { code: true, discountType: true, value: true } },
        items: {
          columns: { id: true, productId: true, productTitle: true, size: true, quantity: true, price: true },
          with: { product: { columns: { images: true, slug: true } } },
        },
      },
    })

    if (!order) return errorResponse('Order not found', 404)

    const transformedOrder = {
      ...order,
      items: order.items.map((item: any) => ({
        id: item.id, productId: item.productId, productTitle: item.productTitle,
        size: item.size, quantity: item.quantity, price: item.price, product: item.product,
      })),
    }

    return successResponse({ order: transformedOrder })
  } catch (error) {
    logger.error('Get order error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
