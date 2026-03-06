import { NextRequest } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { desc, count } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin'
import { successResponse, errorResponse } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    const [userRows, countResult] = await Promise.all([
      db.query.users.findMany({
        offset, limit, orderBy: [desc(users.createdAt)],
        columns: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      }),
      db.select({ count: count() }).from(users),
    ])

    const totalCount = countResult[0]?.count ?? 0

    return successResponse({
      users: userRows, totalCount,
      pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
    })
  } catch (error) {
    logger.error('Admin get users error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
