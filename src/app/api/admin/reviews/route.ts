import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const approved = searchParams.get('approved')
    const featured = searchParams.get('featured')
    const skip = (page - 1) * limit
    const where: { isApproved?: boolean; isFeatured?: boolean } = {}
    if (approved === 'true') {
      where.isApproved = true
    } else if (approved === 'false') {
      where.isApproved = false
    }
    if (featured === 'true') {
      where.isFeatured = true
    }
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ])
    return successResponse({
      reviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    logger.error('Admin get reviews error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const body = await request.json()
    const { userName, rating, comment, media, isFeatured = false, isApproved = true } = body
    if (!userName || userName.trim().length < 2) {
      return errorResponse('Valid user name is required', 400)
    }
    if (!rating || rating < 1 || rating > 5) {
      return errorResponse('Rating must be between 1 and 5', 400)
    }
    const review = await prisma.review.create({
      data: {
        userName: userName.trim(),
        rating,
        comment: comment?.trim() || null,
        media: media || [],
        isFeatured,
        isApproved,
      },
    })
    return successResponse({ review, message: 'Review created successfully' })
  } catch (error) {
    logger.error('Admin create review error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}