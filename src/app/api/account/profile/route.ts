import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, isValidPhone } from '@/lib/utils'
import { logger } from '@/lib/logger'
export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return errorResponse('Unauthorized', 401)
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
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    })
    if (!user) {
      return errorResponse('User not found', 404)
    }
    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        orderCount: user._count.orders,
        addressCount: user._count.addresses,
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
    if (!currentUser) {
      return errorResponse('Unauthorized', 401)
    }
    const body = await request.json()
    const { name, phone } = body
    const updateData: { name?: string; phone?: string } = {}
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return errorResponse('Name must be at least 2 characters', 400)
      }
      updateData.name = name.trim()
    }
    if (phone !== undefined) {
      if (!phone || !isValidPhone(phone)) {
        return errorResponse('Valid 10-digit phone number is required', 400)
      }
      updateData.phone = phone.trim()
    }
    if (Object.keys(updateData).length === 0) {
      return errorResponse('No valid fields to update', 400)
    }
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      data: updateData,
    })
    return successResponse({
      user: updatedUser,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    logger.error('Update profile error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}