import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse, slugify } from '@/lib/utils'
import { logger } from '@/lib/logger'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { id } = await params

    const outfit = await prisma.outfit.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            position: true,
            product: true,
          },
        },
      },
    })

    if (!outfit) {
      return errorResponse('Outfit not found', 404)
    }

    
    const products = outfit.items.map(item => item.product)
    
    
    const individualTotal = products.reduce((sum, product) => sum + product.basePrice, 0)
    const savings = individualTotal - outfit.bundlePrice
    
    const response = {
      ...outfit,
      products, 
      productCount: products.length,
      individualTotal,
      savings,
    }

    return successResponse(response)
  } catch (error) {
    logger.error('Admin get outfit error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { id } = await params

    const outfit = await prisma.outfit.findUnique({
      where: { id },
    })

    if (!outfit) {
      return errorResponse('Outfit not found', 404)
    }

    
    await prisma.outfitItem.deleteMany({
      where: { outfitId: id },
    })

    
    await prisma.cartItem.deleteMany({
      where: { outfitId: id },
    })

    
    await prisma.outfit.delete({
      where: { id },
    })

    return successResponse({ message: 'Outfit deleted successfully' })
  } catch (error) {
    logger.error('Admin delete outfit error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}