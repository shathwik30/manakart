import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active') !== 'false'

    // Pagination with safe defaults and limits
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: {
      isActive?: boolean
      category?: string
    } = {}

    if (active) {
      where.isActive = true
    }

    if (category) {
      where.category = category
    }

    // Get total count for pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          description: true,
          basePrice: true,
          images: true,
          availableSizes: true,
          stockPerSize: true,
          isActive: true,
        },
      }),
      prisma.product.count({ where })
    ])

    return successResponse({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + products.length < totalCount
      }
    })
  } catch (error) {
    logger.error('Get products error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}