
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const outfit = await prisma.outfit.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        genderType: true,
        description: true,
        heroImages: true,
        bundlePrice: true,
        isFeatured: true,
        isActive: true,
        createdAt: true,
        items: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            position: true,
            product: {
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
              },
            },
          },
        },
      },
    })
    if (!outfit) {
      return errorResponse('Outfit not found', 404)
    }
    const individualTotal = outfit.items.reduce(
      (sum: number, item: { product: { basePrice: number } }) => sum + item.product.basePrice,
      0
    )
    const transformedOutfit = {
      id: outfit.id,
      title: outfit.title,
      slug: outfit.slug,
      genderType: outfit.genderType,
      description: outfit.description,
      heroImages: outfit.heroImages,
      bundlePrice: outfit.bundlePrice,
      individualTotal,
      savings: individualTotal - outfit.bundlePrice,
      isFeatured: outfit.isFeatured,
      isActive: outfit.isActive,
      createdAt: outfit.createdAt,
      products: outfit.items.map((item: any) => ({
        id: item.product.id,
        title: item.product.title,
        slug: item.product.slug,
        category: item.product.category,
        description: item.product.description,
        basePrice: item.product.basePrice,
        images: item.product.images,
        sizeChart: item.product.sizeChart,
        availableSizes: item.product.availableSizes,
        stockPerSize: item.product.stockPerSize,
        position: item.position,
      })),
    }
    return successResponse({ outfit: transformedOutfit })
  } catch (error) {
    logger.error('Get outfit error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

