
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const reels = await prisma.reel.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      take: limit,
      select: {
        id: true,
        videoUrl: true,
        thumbnail: true,
        title: true,
        outfitId: true,
      },
    })
    const outfitIds = reels
      .filter((reel) => reel.outfitId)
      .map((reel) => reel.outfitId as string)
    const outfits = outfitIds.length > 0
      ? await prisma.outfit.findMany({
          where: { id: { in: outfitIds } },
          select: {
            id: true,
            title: true,
            slug: true,
            bundlePrice: true,
          },
        })
      : []
    const outfitMap = new Map(outfits.map((o) => [o.id, o]))
    const reelsWithOutfits = reels.map((reel) => ({
      id: reel.id,
      videoUrl: reel.videoUrl,
      thumbnail: reel.thumbnail,
      title: reel.title,
      outfit: reel.outfitId ? outfitMap.get(reel.outfitId) || null : null,
    }))
    return successResponse({ reels: reelsWithOutfits })
  } catch (error) {
    console.error('Get reels error:', error)
    logger.error('Get reels error', { error: String(error) })
    return errorResponse('Something went wrong', 500)
  }
}

