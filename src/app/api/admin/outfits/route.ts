import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse, slugify } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const genderType = searchParams.get('type')?.toUpperCase()
    const skip = (page - 1) * limit
    const where: {
      genderType?: 'GENTLEMEN' | 'LADY' | 'COUPLE'
    } = {}
    if (genderType && ['GENTLEMEN', 'LADY', 'COUPLE'].includes(genderType)) {
      where.genderType = genderType as 'GENTLEMEN' | 'LADY' | 'COUPLE'
    }
    const [outfits, totalCount] = await Promise.all([
      prisma.outfit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          genderType: true,
          heroImages: true,
          bundlePrice: true,
          isActive: true,
          isFeatured: true,
          createdAt: true,
          items: {
            select: {
              product: {
                select: {
                  id: true,
                  title: true,
                  basePrice: true,
                },
              },
            },
          },
        },
      }),
      prisma.outfit.count({ where }),
    ])
    const transformedOutfits = outfits.map((outfit: { id: string; title: string; slug: string; genderType: string; heroImages: string[]; bundlePrice: number; isActive: boolean; isFeatured: boolean; createdAt: Date; items: { product: { basePrice: number } }[] }) => {
      const individualTotal = outfit.items.reduce(
        (sum: number, item: { product: { basePrice: number } }) => sum + item.product.basePrice,
        0
      )
      return {
        ...outfit,
        productCount: outfit.items.length,
        individualTotal,
        savings: individualTotal - outfit.bundlePrice,
      }
    })
    return successResponse({
      outfits: transformedOutfits,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    logger.error('Admin get outfits error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const body = await request.json()
    const {
      title,
      genderType,
      description,
      heroImages,
      bundlePrice,
      productIds,
      isActive = true,
      isFeatured = false,
    } = body
    if (!title || title.trim().length < 2) {
      return errorResponse('Valid title is required', 400)
    }
    if (!genderType || !['GENTLEMEN', 'LADY', 'COUPLE'].includes(genderType)) {
      return errorResponse('Valid gender type is required (GENTLEMEN, LADY, COUPLE)', 400)
    }
    if (!bundlePrice || bundlePrice <= 0) {
      return errorResponse('Valid bundle price is required', 400)
    }
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return errorResponse('At least one product is required', 400)
    }
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })
    if (products.length !== productIds.length) {
      return errorResponse('One or more products not found', 400)
    }
    let slug = slugify(title)
    const existingSlug = await prisma.outfit.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }
    const outfit = await prisma.outfit.create({
      data: {
        title: title.trim(),
        slug,
        genderType,
        description: description?.trim() || null,
        heroImages: heroImages || [],
        bundlePrice,
        isActive,
        isFeatured,
        items: {
          create: productIds.map((productId: string, index: number) => ({
            productId,
            position: index,
          })),
        },
      },
      include: {
        items: {
          select: {
            product: {
              select: {
                id: true,
                title: true,
                basePrice: true,
              },
            },
          },
        },
      },
    })
    return successResponse({ outfit, message: 'Outfit created successfully' })
  } catch (error) {
    logger.error('Admin create outfit error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}