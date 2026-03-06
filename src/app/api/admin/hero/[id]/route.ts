import { NextRequest } from 'next/server'
import { db } from '@/db'
import { heroContents } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params
    const heroContent = await db.query.heroContents.findFirst({ where: eq(heroContents.id, id) })
    if (!heroContent) return errorResponse('Hero content not found', 404)
    return successResponse({ heroContent })
  } catch (error) {
    logger.error('Admin get hero content error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params

    const existing = await db.query.heroContents.findFirst({ where: eq(heroContents.id, id) })
    if (!existing) return errorResponse('Hero content not found', 404)

    const body = await request.json()
    const updateData: Record<string, unknown> = {}

    if (body.title !== undefined) {
      if (!body.title || body.title.trim().length < 2) return errorResponse('Valid title is required', 400)
      updateData.title = body.title.trim()
    }
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle?.trim() || null
    if (body.image !== undefined) {
      if (!body.image || body.image.trim().length < 5) return errorResponse('Valid image URL is required', 400)
      updateData.image = body.image.trim()
    }
    if (body.ctaText !== undefined) updateData.ctaText = body.ctaText?.trim() || null
    if (body.ctaLink !== undefined) updateData.ctaLink = body.ctaLink?.trim() || null
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.position !== undefined) updateData.position = body.position

    const [heroContent] = await db.update(heroContents).set(updateData).where(eq(heroContents.id, id)).returning()
    return successResponse({ heroContent, message: 'Hero content updated successfully' })
  } catch (error) {
    logger.error('Admin update hero content error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params

    const heroContent = await db.query.heroContents.findFirst({ where: eq(heroContents.id, id) })
    if (!heroContent) return errorResponse('Hero content not found', 404)

    await db.delete(heroContents).where(eq(heroContents.id, id))
    return successResponse({ message: 'Hero content deleted successfully' })
  } catch (error) {
    logger.error('Admin delete hero content error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
