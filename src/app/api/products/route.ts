
import { NextRequest } from 'next/server'
import { productService } from '@/lib/services/product-service'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const active = searchParams.get('active') !== 'false'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    const data = await productService.getProducts({
      category,
      isActive: active ? true : undefined,
      page,
      limit,
    })

    return successResponse(data)
  } catch (error) {
    logger.error('Get products error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

