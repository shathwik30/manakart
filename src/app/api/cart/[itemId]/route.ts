import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params
    const currentUser = await getCurrentUser()
    const sessionId = request.cookies.get('session_id')?.value

    if (!currentUser && !sessionId) {
      return errorResponse('Cart not found', 404)
    }

    const body = await request.json()
    const { selectedSizes, quantity } = body

    
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
        outfit: {
          include: {
            items: {
              select: {
                product: {
                  select: { id: true, availableSizes: true, stockPerSize: true },
                },
              },
            },
          },
        },
      },
    })

    if (!cartItem) {
      return errorResponse('Cart item not found', 404)
    }

    
    const isOwner = currentUser
      ? cartItem.cart.userId === currentUser.userId
      : cartItem.cart.sessionId === sessionId

    if (!isOwner) {
      return errorResponse('Unauthorized', 403)
    }

    
    if (quantity !== undefined) {
      if (quantity < 1) {
        return errorResponse('Quantity must be at least 1', 400)
      }

      
      if (cartItem.isBundle && cartItem.outfit) {
        for (const item of cartItem.outfit.items) {
          const size = (selectedSizes || cartItem.selectedSizes as Record<string, string>)[item.product.id]
          const stock = item.product.stockPerSize as Record<string, number>
          if (!stock[size] || stock[size] < quantity) {
            return errorResponse('Insufficient stock', 400)
          }
        }
      } else if (cartItem.product) {
        const size = (selectedSizes || cartItem.selectedSizes as Record<string, string>).size
        const stock = cartItem.product.stockPerSize as Record<string, number>
        if (!stock[size] || stock[size] < quantity) {
          return errorResponse('Insufficient stock', 400)
        }
      }
    }

    
    if (selectedSizes) {
      if (cartItem.isBundle && cartItem.outfit) {
        for (const item of cartItem.outfit.items) {
          const size = selectedSizes[item.product.id]
          if (!size || !item.product.availableSizes.includes(size)) {
            return errorResponse('Invalid size selected', 400)
          }
        }
      } else if (cartItem.product) {
        const size = selectedSizes.size
        if (!size || !cartItem.product.availableSizes.includes(size)) {
          return errorResponse('Invalid size selected', 400)
        }
      }
    }

    
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        ...(selectedSizes && { selectedSizes }),
        ...(quantity !== undefined && { quantity }),
      },
    })

    return successResponse({ item: updatedItem, message: 'Cart updated' })
  } catch (error) {
    logger.error('Update cart error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params
    const currentUser = await getCurrentUser()
    const sessionId = request.cookies.get('session_id')?.value

    if (!currentUser && !sessionId) {
      return errorResponse('Cart not found', 404)
    }

    
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    })

    if (!cartItem) {
      return errorResponse('Cart item not found', 404)
    }

    
    const isOwner = currentUser
      ? cartItem.cart.userId === currentUser.userId
      : cartItem.cart.sessionId === sessionId

    if (!isOwner) {
      return errorResponse('Unauthorized', 403)
    }

    
    await prisma.cartItem.delete({
      where: { id: itemId },
    })

    return successResponse({ message: 'Item removed from cart' })
  } catch (error) {
    logger.error('Delete cart item error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}