import { db } from '@/db'
import { heroContents } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const heroContent = await db.query.heroContents.findMany({
      where: eq(heroContents.isActive, true),
      orderBy: [asc(heroContents.position)],
      columns: {
        id: true, title: true, subtitle: true, image: true,
        ctaText: true, ctaLink: true, position: true,
      },
    })
    return successResponse({ heroContent })
  } catch (error) {
    console.error('Get hero content error:', error)
    logger.error('Get hero content error', { error: String(error) })
    return errorResponse('Something went wrong', 500)
  }
}
