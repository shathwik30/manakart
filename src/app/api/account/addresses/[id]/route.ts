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


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return errorResponse('Unauthorized', 401)
    }

    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: currentUser.userId,
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

    if (!address) {
      return errorResponse('Address not found', 404)
    }

    return successResponse({ address })
  } catch (error) {
    logger.error('Get address error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return errorResponse('Unauthorized', 401)
    }

    
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: currentUser.userId,
      },
    })

    if (!existingAddress) {
      return errorResponse('Address not found', 404)
    }

    const body = await request.json()
    const { name, email, phone, street, city, state, pincode, isDefault } = body

    const updateData: {
      name?: string
      email?: string
      phone?: string
      street?: string
      city?: string
      state?: string
      pincode?: string
      isDefault?: boolean
    } = {}

    
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return errorResponse('Valid name is required', 400)
      }
      updateData.name = name.trim()
    }

    if (email !== undefined) {
      if (!email || !isValidEmail(email)) {
        return errorResponse('Valid email is required', 400)
      }
      updateData.email = email.toLowerCase().trim()
    }

    if (phone !== undefined) {
      if (!phone || !isValidPhone(phone)) {
        return errorResponse('Valid 10-digit phone number is required', 400)
      }
      updateData.phone = phone.trim()
    }

    if (street !== undefined) {
      if (!street || street.trim().length < 5) {
        return errorResponse('Valid street address is required', 400)
      }
      updateData.street = street.trim()
    }

    if (city !== undefined) {
      if (!city || city.trim().length < 2) {
        return errorResponse('Valid city is required', 400)
      }
      updateData.city = city.trim()
    }

    if (state !== undefined) {
      if (!state || state.trim().length < 2) {
        return errorResponse('Valid state is required', 400)
      }
      updateData.state = state.trim()
    }

    if (pincode !== undefined) {
      if (!pincode || !isValidPincode(pincode)) {
        return errorResponse('Valid 6-digit pincode is required', 400)
      }
      updateData.pincode = pincode.trim()
    }

    
    if (isDefault === true) {
      await prisma.address.updateMany({
        where: { userId: currentUser.userId, isDefault: true },
        data: { isDefault: false },
      })
      updateData.isDefault = true
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No valid fields to update', 400)
    }

    const address = await prisma.address.update({
      where: { id },
      data: updateData,
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
      message: 'Address updated successfully',
    })
  } catch (error) {
    logger.error('Update address error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return errorResponse('Unauthorized', 401)
    }

    
    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: currentUser.userId,
      },
    })

    if (!address) {
      return errorResponse('Address not found', 404)
    }

    await prisma.address.delete({
      where: { id },
    })

    
    if (address.isDefault) {
      const anotherAddress = await prisma.address.findFirst({
        where: { userId: currentUser.userId },
        orderBy: { createdAt: 'desc' },
      })

      if (anotherAddress) {
        await prisma.address.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true },
        })
      }
    }

    return successResponse({ message: 'Address deleted successfully' })
  } catch (error) {
    logger.error('Delete address error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}