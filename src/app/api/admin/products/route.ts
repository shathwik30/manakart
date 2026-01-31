
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse, slugify } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit
    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ]
    }
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.product.count({ where })
    ])
    return successResponse({
      products,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    })
  } catch (error) {
    logger.error('Admin get products error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const body = await request.json()
    const {
      title,
      category,
      description,
      basePrice,
      images,
      availableSizes,
      stockPerSize,
      isActive = true
    } = body
    if (!title || title.trim().length < 2) {
      return errorResponse('Valid title is required (min 2 characters)', 400)
    }
    if (!category || category.trim().length < 2) {
      return errorResponse('Valid category is required', 400)
    }
    if (!basePrice || basePrice <= 0) {
      return errorResponse('Valid base price is required', 400)
    }
    if (!images || !Array.isArray(images) || images.length === 0) {
      return errorResponse('At least one image URL is required', 400)
    }
    const urlPattern = /^https?:\/\/.+/i
    for (const imageUrl of images) {
      if (!urlPattern.test(imageUrl)) {
        return errorResponse('Invalid image URL: ' + imageUrl, 400)
      }
    }
    if (!availableSizes || !Array.isArray(availableSizes) || availableSizes.length === 0) {
      return errorResponse('At least one size is required', 400)
    }
    if (!stockPerSize || typeof stockPerSize !== 'object') {
      return errorResponse('Stock per size is required', 400)
    }
    let slug = slugify(title)
    const existingSlug = await prisma.product.findUnique({ where: { slug } })
    if (existingSlug) {
      const timestamp = Date.now()
      slug = slug + '-' + timestamp
    }
    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        slug,
        category: category.trim().toLowerCase(),
        description: description?.trim() || null,
        basePrice,
        images,
        availableSizes,
        stockPerSize,
        isActive,
      },
    })
    return successResponse({ product, message: 'Product created successfully' })
  } catch (error) {
    logger.error('Admin create product error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

