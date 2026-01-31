
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
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

    if (!currentUser) {
      return errorResponse('Unauthorized', 401)
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: currentUser.userId,
      },
      select: {
        id: true,
        orderNumber: true,
        subtotal: true,
        deliveryCharge: true,
        discount: true,
        total: true,
        paymentStatus: true,
        orderStatus: true,
        paymentId: true,
        paymentMethod: true,
        addressSnapshot: true,
        createdAt: true,
        updatedAt: true,
        coupon: {
          select: {
            code: true,
            discountType: true,
            value: true,
          },
        },
        items: {
          select: {
            id: true,
            productId: true,
            productTitle: true,
            outfitId: true,
            outfitTitle: true,
            size: true,
            quantity: true,
            price: true,
            product: {
              select: {
                images: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return errorResponse('Order not found', 404)
    }

    const transformedOrder = {
      ...order,
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productTitle: item.productTitle,
        outfitId: item.outfitId,
        outfitTitle: item.outfitTitle,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        product: item.product,
      })),
    }

    return successResponse({ order: transformedOrder })
  } catch (error) {
    logger.error('Get order error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
