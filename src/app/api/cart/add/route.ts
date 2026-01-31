
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, generateSessionId } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    let sessionId = request.cookies.get('session_id')?.value
    const body = await request.json()
    const { outfitId, productId, selectedSizes, quantity = 1, isBundle = false } = body
    if (!outfitId && !productId) {
      return errorResponse('Either outfitId or productId is required', 400)
    }
    if (!selectedSizes || typeof selectedSizes !== 'object') {
      return errorResponse('Selected sizes are required', 400)
    }
    let priceSnapshot = 0
    if (isBundle && outfitId) {
      const outfit = await prisma.outfit.findUnique({
        where: { id: outfitId, isActive: true },
        include: {
          items: {
            select: {
              product: {
                select: { id: true, availableSizes: true, stockPerSize: true },
              },
            },
          },
        },
      })
      if (!outfit) {
        return errorResponse('Outfit not found', 404)
      }
      for (const item of outfit.items) {
        const size = selectedSizes[item.product.id]
        if (!size) {
          return errorResponse(`Size required for all products in outfit`, 400)
        }
        if (!item.product.availableSizes.includes(size)) {
          return errorResponse(`Invalid size for product`, 400)
        }
        const stock = item.product.stockPerSize as Record<string, number>
        if (!stock[size] || stock[size] < quantity) {
          return errorResponse(`Insufficient stock for selected size`, 400)
        }
      }
      priceSnapshot = outfit.bundlePrice
    }
    if (!isBundle && productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId, isActive: true },
      })
      if (!product) {
        return errorResponse('Product not found', 404)
      }
      const size = selectedSizes.size
      if (!size) {
        return errorResponse('Size is required', 400)
      }
      if (!product.availableSizes.includes(size)) {
        return errorResponse('Invalid size selected', 400)
      }
      const stock = product.stockPerSize as Record<string, number>
      if (!stock[size] || stock[size] < quantity) {
        return errorResponse('Insufficient stock for selected size', 400)
      }
      priceSnapshot = product.basePrice
    }
    let cart = await prisma.cart.findFirst({
      where: currentUser
        ? { userId: currentUser.userId }
        : sessionId
          ? { sessionId }
          : { id: 'none' }, 
    })
    if (!currentUser && !sessionId) {
      sessionId = generateSessionId()
    }
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: currentUser?.userId || null,
          sessionId: currentUser ? null : sessionId,
        },
      })
    }
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        outfitId: isBundle ? outfitId : null,
        productId: !isBundle ? productId : null,
        isBundle,
      },
    })
    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          selectedSizes,
        },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          outfitId: isBundle ? outfitId : null,
          productId: !isBundle ? productId : null,
          selectedSizes,
          quantity,
          isBundle,
          priceSnapshot,
        },
      })
    }
    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    })
    const response = NextResponse.json(
      { success: true, data: { message: 'Item added to cart' } },
      { status: 200 }
    )
    if (!currentUser && sessionId) {
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, 
        path: '/',
      })
    }
    return response
  } catch (error) {
    logger.error('Add to cart error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

