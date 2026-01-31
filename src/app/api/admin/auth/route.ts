
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { generateToken, setAuthCookie } from '@/lib/auth'
import { successResponse, errorResponse, isValidEmail } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, secretKey } = body
    if (!email || !isValidEmail(email)) {
      return errorResponse('Valid email is required', 400)
    }
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return errorResponse('Invalid credentials', 401)
    }
    const normalizedEmail = email.toLowerCase().trim()
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Admin account not found', 404)
    }
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    await setAuthCookie(token)
    return successResponse({
      message: 'Admin logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    logger.error('Admin auth error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

