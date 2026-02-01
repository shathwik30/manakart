
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') !== 'false'
    const limit = parseInt(searchParams.get('limit') || '10')
    const reviews = await prisma.review.findMany({
      where: {
        isApproved: true,
        ...(featured && { isFeatured: true }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userName: true,
        rating: true,
        comment: true,
        media: true,
        createdAt: true,
      },
    })
    const allReviews = await prisma.review.findMany({
      where: { isApproved: true },
      select: { rating: true },
    })
    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allReviews.length
        : 0
    return successResponse({
      reviews,
      stats: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: allReviews.length,
      },
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    logger.error('Get reviews error', { error: String(error) })
    return errorResponse('Something went wrong', 500)
  }
}

