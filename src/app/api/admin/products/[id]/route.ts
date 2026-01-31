import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse, slugify } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        outfitItems: {
          select: {
            outfit: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    })
    if (!product) {
      return errorResponse('Product not found', 404)
    }
    return successResponse({ product })
  } catch (error) {
    logger.error('Admin get product error', { error: error instanceof Error ? error.message : 'Unknown error' })
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
    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      return errorResponse('Product not found', 404)
    }
    const body = await request.json()
    const {
      title,
      category,
      description,
      basePrice,
      images,
      availableSizes,
      stockPerSize,
      isActive
    } = body
    const updateData: Record<string, any> = {}
    if (title !== undefined) {
      if (title.trim().length < 2) {
        return errorResponse('Valid title is required', 400)
      }
      updateData.title = title.trim()
      let slug = slugify(title)
      const existingSlug = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      })
      if (existingSlug) {
        const timestamp = Date.now()
        slug = slug + '-' + timestamp
      }
      updateData.slug = slug
    }
    if (category !== undefined) {
      if (category.trim().length < 2) {
        return errorResponse('Valid category is required', 400)
      }
      updateData.category = category.trim().toLowerCase()
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }
    if (basePrice !== undefined) {
      if (basePrice <= 0) {
        return errorResponse('Valid base price is required', 400)
      }
      updateData.basePrice = basePrice
    }
    if (images !== undefined) {
      if (!Array.isArray(images) || images.length === 0) {
        return errorResponse('At least one image URL is required', 400)
      }
      const urlPattern = /^https?:\/\/.+/i
      for (const imageUrl of images) {
        if (!urlPattern.test(imageUrl)) {
          return errorResponse('Invalid image URL: ' + imageUrl, 400)
        }
      }
      updateData.images = images
    }
    if (availableSizes !== undefined) {
      if (!Array.isArray(availableSizes) || availableSizes.length === 0) {
        return errorResponse('At least one size is required', 400)
      }
      updateData.availableSizes = availableSizes
    }
    if (stockPerSize !== undefined) {
      if (typeof stockPerSize !== 'object') {
        return errorResponse('Valid stock per size is required', 400)
      }
      updateData.stockPerSize = stockPerSize
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    })
    return successResponse({ product, message: 'Product updated successfully' })
  } catch (error) {
    logger.error('Admin update product error', { error: error instanceof Error ? error.message : 'Unknown error' })
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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { outfitItems: true, orderItems: true },
        },
      },
    })
    if (!product) {
      return errorResponse('Product not found', 404)
    }
    if (product._count.orderItems > 0) {
      return errorResponse(
        'Cannot delete product with existing orders. Deactivate instead.',
        400
      )
    }
    await prisma.outfitItem.deleteMany({
      where: { productId: id },
    })
    await prisma.product.delete({
      where: { id },
    })
    return successResponse({ message: 'Product deleted successfully' })
  } catch (error) {
    logger.error('Admin delete product error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}