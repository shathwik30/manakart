
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let product = await prisma.product.findUnique({
      where: { slug: id },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        description: true,
        basePrice: true,
        images: true,
        sizeChart: true,
        availableSizes: true,
        stockPerSize: true,
        isActive: true,
        createdAt: true,
      },
    })
    if (!product) {
      product = await prisma.product.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          description: true,
          basePrice: true,
          images: true,
          sizeChart: true,
          availableSizes: true,
          stockPerSize: true,
          isActive: true,
          createdAt: true,
        },
      })
    }
    if (!product) {
      return errorResponse('Product not found', 404)
    }
    return successResponse({ product })
  } catch (error) {
    logger.error('Get product error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

