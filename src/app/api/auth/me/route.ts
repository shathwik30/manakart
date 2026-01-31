
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return errorResponse('Not authenticated', 401)
    }
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    })
    if (!user) {
      return errorResponse('User not found', 404)
    }
    return successResponse({ user })
  } catch (error) {
    logger.error('Get me error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

