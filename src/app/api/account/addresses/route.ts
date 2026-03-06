import { NextRequest } from 'next/server'
import { db } from '@/db'
import { addresses } from '@/db/schema'
import { eq, and, desc, count } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, isValidEmail, isValidPhone, isValidPincode } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return errorResponse('Unauthorized', 401)

    const result = await db.query.addresses.findMany({
      where: eq(addresses.userId, currentUser.userId),
      orderBy: [desc(addresses.isDefault), desc(addresses.createdAt)],
      columns: {
        id: true, name: true, email: true, phone: true, street: true,
        city: true, state: true, pincode: true, country: true, isDefault: true, createdAt: true,
      },
    })
    return successResponse({ addresses: result })
  } catch (error) {
    logger.error('Get addresses error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { name, email, phone, street, city, state, pincode, isDefault } = body

    if (!name || name.trim().length < 2) return errorResponse('Valid name is required', 400)
    if (!email || !isValidEmail(email)) return errorResponse('Valid email is required', 400)
    if (!phone || !isValidPhone(phone)) return errorResponse('Valid 10-digit phone number is required', 400)
    if (!street || street.trim().length < 5) return errorResponse('Valid street address is required', 400)
    if (!city || city.trim().length < 2) return errorResponse('Valid city is required', 400)
    if (!state || state.trim().length < 2) return errorResponse('Valid state is required', 400)
    if (!pincode || !isValidPincode(pincode)) return errorResponse('Valid 6-digit pincode is required', 400)

    const addressCountResult = await db.select({ count: count() }).from(addresses).where(eq(addresses.userId, currentUser.userId))
    const addressCount = addressCountResult[0]?.count ?? 0

    if (addressCount >= 10) return errorResponse('Maximum of 10 addresses allowed', 400)

    if (isDefault) {
      await db.update(addresses).set({ isDefault: false }).where(and(eq(addresses.userId, currentUser.userId), eq(addresses.isDefault, true)))
    }

    const [address] = await db.insert(addresses).values({
      userId: currentUser.userId,
      name: name.trim(), email: email.toLowerCase().trim(), phone: phone.trim(),
      street: street.trim(), city: city.trim(), state: state.trim(), pincode: pincode.trim(),
      country: 'India', isDefault: isDefault || addressCount === 0,
    }).returning()

    return successResponse({ address, message: 'Address added successfully' })
  } catch (error) {
    logger.error('Create address error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
