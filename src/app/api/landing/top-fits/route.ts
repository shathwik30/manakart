import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET() {
  try {
    const [gentlemen, lady, couple] = await Promise.all([
      prisma.outfit.findMany({
        where: {
          isActive: true,
          isFeatured: true,
          genderType: 'GENTLEMEN',
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          heroImages: true,
          bundlePrice: true,
          items: {
            select: {
              product: {
                select: {
                  basePrice: true,
                },
              },
            },
          },
        },
      }),
      prisma.outfit.findMany({
        where: {
          isActive: true,
          isFeatured: true,
          genderType: 'LADY',
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          heroImages: true,
          bundlePrice: true,
          items: {
            select: {
              product: {
                select: {
                  basePrice: true,
                },
              },
            },
          },
        },
      }),
      prisma.outfit.findMany({
        where: {
          isActive: true,
          isFeatured: true,
          genderType: 'COUPLE',
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          heroImages: true,
          bundlePrice: true,
          items: {
            select: {
              product: {
                select: {
                  basePrice: true,
                },
              },
            },
          },
        },
      }),
    ])
    type Outfit = {
      id: string
      title: string
      slug: string
      heroImages: string[]
      bundlePrice: number
      items: {
        product: {
          basePrice: number
        }
      }[]
    }
    const transformOutfits = (outfits: Outfit[]) =>
      outfits.map((outfit) => {
        const individualTotal = outfit.items.reduce(
          (sum: number, item: { product: { basePrice: number } }) => sum + item.product.basePrice,
          0
        )
        return {
          id: outfit.id,
          title: outfit.title,
          slug: outfit.slug,
          heroImage: outfit.heroImages[0] || null,
          bundlePrice: outfit.bundlePrice,
          individualTotal,
          savings: individualTotal - outfit.bundlePrice,
          productCount: outfit.items.length,
        }
      })
    return successResponse({
      topFits: {
        gentlemen: transformOutfits(gentlemen),
        lady: transformOutfits(lady),
        couple: transformOutfits(couple),
      },
    })
  } catch (error) {
    logger.error('Get top fits error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}