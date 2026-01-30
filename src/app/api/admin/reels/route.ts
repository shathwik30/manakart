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
    const active = searchParams.get('active')

    // Pagination with safe defaults
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const skip = (page - 1) * limit

    const where: { isActive?: boolean } = {}

    if (active === 'true') {
      where.isActive = true
    } else if (active === 'false') {
      where.isActive = false
    }

    const [reels, totalCount] = await Promise.all([
      prisma.reel.findMany({
        where,
        orderBy: { position: 'asc' },
        take: limit,
        skip,
      }),
      prisma.reel.count({ where })
    ])

    return successResponse({
      reels,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + reels.length < totalCount
      }
    })
  } catch (error) {
    logger.error('Admin get reels error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}


export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const { videoUrl, thumbnail, title, outfitId, isActive = true, position } = body

    
    if (!videoUrl || videoUrl.trim().length < 5) {
      return errorResponse('Valid video URL is required', 400)
    }

    
    if (outfitId) {
      const outfit = await prisma.outfit.findUnique({ where: { id: outfitId } })
      if (!outfit) {
        return errorResponse('Outfit not found', 404)
      }
    }

    
    let finalPosition = position
    if (finalPosition === undefined) {
      const maxPosition = await prisma.reel.aggregate({
        _max: { position: true },
      })
      finalPosition = (maxPosition._max.position || 0) + 1
    }

    const reel = await prisma.reel.create({
      data: {
        videoUrl: videoUrl.trim(),
        thumbnail: thumbnail?.trim() || null,
        title: title?.trim() || null,
        outfitId: outfitId || null,
        isActive,
        position: finalPosition,
      },
    })

    return successResponse({ reel, message: 'Reel created successfully' })
  } catch (error) {
    logger.error('Admin create reel error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
