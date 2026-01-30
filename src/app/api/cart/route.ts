import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    const sessionId = request.cookies.get('session_id')?.value

    if (!currentUser && !sessionId) {
      return successResponse({
        cart: null,
        items: [],
        subtotal: 0,
        itemCount: 0,
      })
    }

    
    const cart = await prisma.cart.findFirst({
      where: currentUser
        ? { userId: currentUser.userId }
        : { sessionId: sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                basePrice: true,
                images: true,
                availableSizes: true,
                stockPerSize: true,
              },
            },
            outfit: {
              select: {
                id: true,
                title: true,
                slug: true,
                heroImages: true,
                bundlePrice: true,
                items: {
                  orderBy: { position: 'asc' },
                  select: {
                    product: {
                      select: {
                        id: true,
                        title: true,
                        slug: true,
                        category: true,
                        basePrice: true,
                        images: true,
                        availableSizes: true,
                        stockPerSize: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!cart) {
      return successResponse({
        cart: null,
        items: [],
        subtotal: 0,
        itemCount: 0,
      })
    }

    
    const transformedItems = cart.items.map((item: any) => {
      if (item.isBundle && item.outfit) {
        
        return {
          id: item.id,
          type: 'outfit' as const,
          outfit: {
            id: item.outfit.id,
            title: item.outfit.title,
            slug: item.outfit.slug,
            heroImages: item.outfit.heroImages,
            bundlePrice: item.outfit.bundlePrice,
            products: item.outfit.items.map((oi: any) => oi.product),
          },
          selectedSizes: item.selectedSizes,
          quantity: item.quantity,
          price: item.priceSnapshot,
        }
      } else if (item.product) {
        
        return {
          id: item.id,
          type: 'product' as const,
          product: item.product,
          selectedSizes: item.selectedSizes,
          quantity: item.quantity,
          price: item.priceSnapshot,
        }
      }
      return null
    }).filter(Boolean)

    
    const subtotal = cart.items.reduce(
      (sum: number, item: { priceSnapshot: number; quantity: number }) => sum + item.priceSnapshot * item.quantity,
      0
    )

    
    const itemCount = cart.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)

    return successResponse({
      cart: {
        id: cart.id,
        userId: cart.userId,
        sessionId: cart.sessionId,
      },
      items: transformedItems,
      subtotal,
      itemCount,
    })
  } catch (error) {
    logger.error('Get cart error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}