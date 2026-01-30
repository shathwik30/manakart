import { getCurrentUser } from './auth'
import { errorResponse } from './utils'

export async function requireAdmin() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { error: errorResponse('Unauthorized', 401), user: null }
  }

  if (currentUser.role !== 'ADMIN') {
    return { error: errorResponse('Forbidden: Admin access required', 403), user: null }
  }

  return { error: null, user: currentUser }
}