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
    const reel = await prisma.reel.findUnique({
      where: { id },
    })
    if (!reel) {
      return errorResponse('Reel not found', 404)
    }
    return successResponse({ reel })
  } catch (error) {
    logger.error('Admin get reel error', { error: error instanceof Error ? error.message : 'Unknown error' })
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
    const existing = await prisma.reel.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Reel not found', 404)
    }
    const body = await request.json()
    const { videoUrl, thumbnail, title, outfitId, isActive, position } = body
    const updateData: Record<string, unknown> = {}
    if (videoUrl !== undefined) {
      if (!videoUrl || videoUrl.trim().length < 5) {
        return errorResponse('Valid video URL is required', 400)
      }
      updateData.videoUrl = videoUrl.trim()
    }
    if (thumbnail !== undefined) {
      updateData.thumbnail = thumbnail?.trim() || null
    }
    if (title !== undefined) {
      updateData.title = title?.trim() || null
    }
    if (outfitId !== undefined) {
      if (outfitId) {
        const outfit = await prisma.outfit.findUnique({ where: { id: outfitId } })
        if (!outfit) {
          return errorResponse('Outfit not found', 404)
        }
      }
      updateData.outfitId = outfitId || null
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }
    if (position !== undefined) {
      updateData.position = position
    }
    const reel = await prisma.reel.update({
      where: { id },
      data: updateData,
    })
    return successResponse({ reel, message: 'Reel updated successfully' })
  } catch (error) {
    logger.error('Admin update reel error', { error: error instanceof Error ? error.message : 'Unknown error' })
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
    const reel = await prisma.reel.findUnique({ where: { id } })
    if (!reel) {
      return errorResponse('Reel not found', 404)
    }
    await prisma.reel.delete({
      where: { id },
    })
    return successResponse({ message: 'Reel deleted successfully' })
  } catch (error) {
    logger.error('Admin delete reel error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}