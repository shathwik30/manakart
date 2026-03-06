import { NextRequest } from 'next/server'
import { db } from '@/db'
import { users, orders, addresses } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, isValidPhone } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return errorResponse('Unauthorized', 401)

    const user = await db.query.users.findFirst({
      where: eq(users.id, currentUser.userId),
      columns: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    })
    if (!user) return errorResponse('User not found', 404)

    const [orderCount, addressCount] = await Promise.all([
      db.select({ count: count() }).from(orders).where(eq(orders.userId, currentUser.userId)),
      db.select({ count: count() }).from(addresses).where(eq(addresses.userId, currentUser.userId)),
    ])

    return successResponse({
      user: {
        ...user,
        orderCount: orderCount[0]?.count ?? 0,
        addressCount: addressCount[0]?.count ?? 0,
      },
    })
  } catch (error) {
    logger.error('Get profile error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { name, phone } = body
    const updateData: { name?: string; phone?: string } = {}

    if (name !== undefined) {
      if (!name || name.trim().length < 2) return errorResponse('Name must be at least 2 characters', 400)
      updateData.name = name.trim()
    }
    if (phone !== undefined) {
      if (!phone || !isValidPhone(phone)) return errorResponse('Valid 10-digit phone number is required', 400)
      updateData.phone = phone.trim()
    }
    if (Object.keys(updateData).length === 0) return errorResponse('No valid fields to update', 400)

    const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, currentUser.userId)).returning({
      id: users.id, email: users.email, name: users.name, phone: users.phone, role: users.role, createdAt: users.createdAt,
    })

    return successResponse({ user: updatedUser, message: 'Profile updated successfully' })
  } catch (error) {
    logger.error('Update profile error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
