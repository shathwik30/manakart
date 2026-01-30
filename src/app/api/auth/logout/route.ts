import { clearAuthCookie } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function POST() {
  try {
    await clearAuthCookie()
    return successResponse({ message: 'Logged out successfully' })
  } catch (error) {
    logger.error('Logout error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}