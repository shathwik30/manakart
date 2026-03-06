import { NextRequest } from 'next/server'
import { db } from '@/db'
import { reviews } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') !== 'false'
    const limit = parseInt(searchParams.get('limit') || '10')

    const conditions: any[] = [eq(reviews.isApproved, true)]
    if (featured) conditions.push(eq(reviews.isFeatured, true))

    const reviewRows = await db.query.reviews.findMany({
      where: and(...conditions),
      limit,
      orderBy: [desc(reviews.createdAt)],
      columns: {
        id: true, userName: true, rating: true, comment: true, media: true, createdAt: true,
      },
    })

    const allReviews = await db.query.reviews.findMany({
      where: eq(reviews.isApproved, true),
      columns: { rating: true },
    })

    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allReviews.length
      : 0

    return successResponse({
      reviews: reviewRows,
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
