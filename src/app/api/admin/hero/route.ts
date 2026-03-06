import { NextRequest } from 'next/server'
import { db } from '@/db'
import { heroContents } from '@/db/schema'
import { eq, asc, max } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const where = active === 'true' ? eq(heroContents.isActive, true) : active === 'false' ? eq(heroContents.isActive, false) : undefined

    const heroContent = await db.query.heroContents.findMany({ where, orderBy: [asc(heroContents.position)] })
    return successResponse({ heroContent })
  } catch (error) {
    logger.error('Admin get hero content error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const { title, subtitle, image, ctaText, ctaLink, isActive = true, position } = body

    if (!title || title.trim().length < 2) return errorResponse('Valid title is required', 400)
    if (!image || image.trim().length < 5) return errorResponse('Valid image URL is required', 400)

    let finalPosition = position
    if (finalPosition === undefined) {
      const [maxPos] = await db.select({ max: max(heroContents.position) }).from(heroContents)
      finalPosition = (maxPos?.max ?? 0) + 1
    }

    const [heroContent] = await db.insert(heroContents).values({
      title: title.trim(), subtitle: subtitle?.trim() || null, image: image.trim(),
      ctaText: ctaText?.trim() || null, ctaLink: ctaLink?.trim() || null, isActive, position: finalPosition,
    }).returning()

    return successResponse({ heroContent, message: 'Hero content created successfully' })
  } catch (error) {
    logger.error('Admin create hero content error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
