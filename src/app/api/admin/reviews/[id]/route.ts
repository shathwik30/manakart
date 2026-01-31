import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params
    const review = await prisma.review.findUnique({
      where: { id },
    })
    if (!review) {
      return errorResponse('Review not found', 404)
    }
    return successResponse({ review })
  } catch (error) {
    logger.error('Admin get review error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params
    const existingReview = await prisma.review.findUnique({ where: { id } })
    if (!existingReview) {
      return errorResponse('Review not found', 404)
    }
    const body = await request.json()
    const { userName, rating, comment, media, isFeatured, isApproved } = body
    const updateData: Record<string, unknown> = {}
    if (userName !== undefined) {
      if (!userName || userName.trim().length < 2) {
        return errorResponse('Valid user name is required', 400)
      }
      updateData.userName = userName.trim()
    }
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return errorResponse('Rating must be between 1 and 5', 400)
      }
      updateData.rating = rating
    }
    if (comment !== undefined) {
      updateData.comment = comment?.trim() || null
    }
    if (media !== undefined) {
      updateData.media = media || []
    }
    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured
    }
    if (isApproved !== undefined) {
      updateData.isApproved = isApproved
    }
    const review = await prisma.review.update({
      where: { id },
      data: updateData,
    })
    return successResponse({ review, message: 'Review updated successfully' })
  } catch (error) {
    logger.error('Admin update review error', { error: error instanceof Error ? error.message : 'Unknown error' })
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
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
      return errorResponse('Review not found', 404)
    }
    await prisma.review.delete({
      where: { id },
    })
    return successResponse({ message: 'Review deleted successfully' })
  } catch (error) {
    logger.error('Admin delete review error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}