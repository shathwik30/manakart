import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET() {
  try {
    const heroContent = await prisma.heroContent.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        title: true,
        subtitle: true,
        image: true,
        ctaText: true,
        ctaLink: true,
        position: true,
      },
    })
    return successResponse({ heroContent })
  } catch (error) {
    console.error('Get hero content error:', error)
    logger.error('Get hero content error', { error: String(error) })
    return errorResponse('Something went wrong', 500)
  }
}