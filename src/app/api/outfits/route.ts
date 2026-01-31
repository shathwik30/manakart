import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')?.toUpperCase()
    const featured = searchParams.get('featured') === 'true'
    const active = searchParams.get('active') !== 'false'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    const skip = (page - 1) * limit
    const where: {
      isActive?: boolean
      isFeatured?: boolean
      genderType?: 'GENTLEMEN' | 'LADY' | 'COUPLE'
    } = {}
    if (active) {
      where.isActive = true
    }
    if (featured) {
      where.isFeatured = true
    }
    if (type && ['GENTLEMEN', 'LADY', 'COUPLE'].includes(type)) {
      where.genderType = type as 'GENTLEMEN' | 'LADY' | 'COUPLE'
    }
    const [outfits, totalCount] = await Promise.all([
      prisma.outfit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
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
          items: {
            orderBy: { position: 'asc' },
            select: {
              position: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                  basePrice: true,
                  images: true,
                },
              },
            },
          },
        },
      }),
      prisma.outfit.count({ where })
    ])
    const transformedOutfits = outfits.map((outfit: any) => ({
      id: outfit.id,
      title: outfit.title,
      slug: outfit.slug,
      genderType: outfit.genderType,
      description: outfit.description,
      heroImages: outfit.heroImages,
      bundlePrice: outfit.bundlePrice,
      isFeatured: outfit.isFeatured,
      isActive: outfit.isActive,
      productCount: outfit.items.length,
      products: outfit.items.map((item: any) => item.product),
    }))
    return successResponse({
      outfits: transformedOutfits,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + outfits.length < totalCount
      }
    })
  } catch (error) {
    logger.error('Get outfits error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}