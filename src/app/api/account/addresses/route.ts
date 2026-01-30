import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
  successResponse,
  errorResponse,
  isValidEmail,
  isValidPhone,
  isValidPincode,
} from '@/lib/utils'
import { logger } from '@/lib/logger'


export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return errorResponse('Unauthorized', 401)
    }

    const addresses = await prisma.address.findMany({
      where: { userId: currentUser.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        street: true,
        city: true,
        state: true,
        pincode: true,
        country: true,
        isDefault: true,
        createdAt: true,
      },
    })

    return successResponse({ addresses })
  } catch (error) {
    logger.error('Get addresses error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}


export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { name, email, phone, street, city, state, pincode, isDefault } = body

    
    if (!name || name.trim().length < 2) {
      return errorResponse('Valid name is required', 400)
    }

    if (!email || !isValidEmail(email)) {
      return errorResponse('Valid email is required', 400)
    }

    if (!phone || !isValidPhone(phone)) {
      return errorResponse('Valid 10-digit phone number is required', 400)
    }

    if (!street || street.trim().length < 5) {
      return errorResponse('Valid street address is required', 400)
    }

    if (!city || city.trim().length < 2) {
      return errorResponse('Valid city is required', 400)
    }

    if (!state || state.trim().length < 2) {
      return errorResponse('Valid state is required', 400)
    }

    if (!pincode || !isValidPincode(pincode)) {
      return errorResponse('Valid 6-digit pincode is required', 400)
    }

    
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: currentUser.userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    
    const addressCount = await prisma.address.count({
      where: { userId: currentUser.userId },
    })

    const address = await prisma.address.create({
      data: {
        userId: currentUser.userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: 'India',
        isDefault: isDefault || addressCount === 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        street: true,
        city: true,
        state: true,
        pincode: true,
        country: true,
        isDefault: true,
        createdAt: true,
      },
    })

    return successResponse({
      address,
      message: 'Address added successfully',
    })
  } catch (error) {
    logger.error('Create address error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}