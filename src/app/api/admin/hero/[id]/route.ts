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
    const heroContent = await prisma.heroContent.findUnique({
      where: { id },
    })
    if (!heroContent) {
      return errorResponse('Hero content not found', 404)
    }
    return successResponse({ heroContent })
  } catch (error) {
    logger.error('Admin get hero content error', { error: error instanceof Error ? error.message : 'Unknown error' })
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
    const existing = await prisma.heroContent.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Hero content not found', 404)
    }
    const body = await request.json()
    const { title, subtitle, image, ctaText, ctaLink, isActive, position } = body
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) {
      if (!title || title.trim().length < 2) {
        return errorResponse('Valid title is required', 400)
      }
      updateData.title = title.trim()
    }
    if (subtitle !== undefined) {
      updateData.subtitle = subtitle?.trim() || null
    }
    if (image !== undefined) {
      if (!image || image.trim().length < 5) {
        return errorResponse('Valid image URL is required', 400)
      }
      updateData.image = image.trim()
    }
    if (ctaText !== undefined) {
      updateData.ctaText = ctaText?.trim() || null
    }
    if (ctaLink !== undefined) {
      updateData.ctaLink = ctaLink?.trim() || null
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }
    if (position !== undefined) {
      updateData.position = position
    }
    const heroContent = await prisma.heroContent.update({
      where: { id },
      data: updateData,
    })
    return successResponse({ heroContent, message: 'Hero content updated successfully' })
  } catch (error) {
    logger.error('Admin update hero content error', { error: error instanceof Error ? error.message : 'Unknown error' })
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
    const heroContent = await prisma.heroContent.findUnique({ where: { id } })
    if (!heroContent) {
      return errorResponse('Hero content not found', 404)
    }
    await prisma.heroContent.delete({
      where: { id },
    })
    return successResponse({ message: 'Hero content deleted successfully' })
  } catch (error) {
    logger.error('Admin delete hero content error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}