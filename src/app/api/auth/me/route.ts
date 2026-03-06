import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return errorResponse('Not authenticated', 401)
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, currentUser.userId),
      columns: {
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
