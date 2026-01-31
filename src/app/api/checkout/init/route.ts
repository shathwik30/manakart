
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
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    const sessionId = request.cookies.get('session_id')?.value
    if (!currentUser && !sessionId) {
      return errorResponse('Cart not found', 400)
    }
    const body = await request.json()
    const { address, savedAddressId } = body
    const cart = await prisma.cart.findFirst({
      where: currentUser
        ? { userId: currentUser.userId }
        : { sessionId },
      include: {
        items: {
          include: {
            product: true,
            outfit: {
              include: {
                items: {
                  select: {
                    product: {
                      select: {
                        id: true,
                        title: true,
                        stockPerSize: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
    if (!cart || cart.items.length === 0) {
      return errorResponse('Cart is empty', 400)
    }
    let checkoutAddress
    if (savedAddressId && currentUser) {
      const savedAddress = await prisma.address.findFirst({
        where: {
          id: savedAddressId,
          userId: currentUser.userId,
        },
      })
      if (!savedAddress) {
        return errorResponse('Saved address not found', 404)
      }
      checkoutAddress = {
        name: savedAddress.name,
        email: savedAddress.email,
        phone: savedAddress.phone,
        street: savedAddress.street,
        city: savedAddress.city,
        state: savedAddress.state,
        pincode: savedAddress.pincode,
        country: savedAddress.country,
      }
    } else if (address) {
      const { name, email, phone, street, city, state, pincode } = address
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
      checkoutAddress = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: 'India',
      }
    } else {
      return errorResponse('Address is required', 400)
    }
    for (const item of cart.items) {
      if (item.isBundle && item.outfit) {
        const selectedSizes = item.selectedSizes as Record<string, string>
        for (const outfitItem of item.outfit.items) {
          const size = selectedSizes[outfitItem.product.id]
          const stock = outfitItem.product.stockPerSize as Record<string, number>
          if (!stock[size] || stock[size] < item.quantity) {
            return errorResponse(
              `Insufficient stock for ${outfitItem.product.title} (${size})`,
              400
            )
          }
        }
      } else if (item.product) {
        const selectedSizes = item.selectedSizes as Record<string, string>
        const size = selectedSizes.size
        const stock = item.product.stockPerSize as Record<string, number>
        if (!stock[size] || stock[size] < item.quantity) {
          return errorResponse(
            `Insufficient stock for ${item.product.title} (${size})`,
            400
          )
        }
      }
    }
    const subtotal = cart.items.reduce(
      (sum: number, item: { priceSnapshot: number; quantity: number }) => sum + item.priceSnapshot * item.quantity,
      0
    )
    const deliveryCharge = 0
    const total = subtotal
    const requiresOtp = !currentUser
    return successResponse({
      checkoutSession: {
        cartId: cart.id,
        address: checkoutAddress,
        items: cart.items.map((item: any) => ({
          id: item.id,
          type: item.isBundle ? 'outfit' : 'product',
          title: item.isBundle ? item.outfit?.title : item.product?.title,
          selectedSizes: item.selectedSizes,
          quantity: item.quantity,
          price: item.priceSnapshot,
        })),
        subtotal,
        deliveryCharge,
        discount: 0,
        total,
        requiresOtp,
      },
    })
  } catch (error) {
    logger.error('Checkout init error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

