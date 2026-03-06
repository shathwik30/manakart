import { NextRequest } from 'next/server'
import { db } from '@/db'
import { otps, users } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { verifyOTP, generateToken, setAuthCookie } from '@/lib/auth'
import { successResponse, errorResponse, isValidEmail, isValidPhone } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, name, phone } = body

    if (!email || !isValidEmail(email)) {
      return errorResponse('Valid email is required', 400)
    }
    if (!otp || otp.length !== 6) {
      return errorResponse('Valid 6-digit OTP is required', 400)
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Look for any OTP (verified or unverified) for this email
    const otpRecord = await db.query.otps.findFirst({
      where: eq(otps.email, normalizedEmail),
      orderBy: [desc(otps.createdAt)],
    })

    if (!otpRecord) {
      return errorResponse('No OTP found. Please request a new one.', 400)
    }

    // If OTP was already verified (registration step 2), skip code check
    if (!otpRecord.verified) {
      if (new Date() > otpRecord.expiresAt) {
        await db.delete(otps).where(eq(otps.id, otpRecord.id))
        return errorResponse('OTP has expired. Please request a new one.', 400)
      }

      if (otpRecord.attempts >= 3) {
        await db.delete(otps).where(eq(otps.id, otpRecord.id))
        return errorResponse('Too many attempts. Please request a new OTP.', 400)
      }

      const isValid = await verifyOTP(otp, otpRecord.code)

      if (!isValid) {
        await db.update(otps).set({ attempts: otpRecord.attempts + 1 }).where(eq(otps.id, otpRecord.id))
        return errorResponse('Invalid OTP. Please try again.', 400)
      }

      // Mark as verified instead of deleting
      await db.update(otps).set({ verified: true }).where(eq(otps.id, otpRecord.id))
    }

    let user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    })

    let isNewUser = false

    if (!user) {
      if (!name || !phone) {
        // Return success so the client can show the registration form
        return successResponse({ isNewUser: true, needsRegistration: true })
      }
      if (!isValidPhone(phone)) {
        return errorResponse('Valid 10-digit phone number is required', 400)
      }
      const [newUser] = await db.insert(users).values({
        email: normalizedEmail,
        name: name.trim(),
        phone: phone.trim(),
      }).returning()
      user = newUser
      isNewUser = true
    }

    // Clean up OTP now that login/registration is complete
    await db.delete(otps).where(eq(otps.id, otpRecord.id))

    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    await setAuthCookie(token)

    return successResponse({
      message: isNewUser ? 'Account created successfully' : 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      isNewUser,
    })
  } catch (error) {
    logger.error('Verify OTP error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
