import { NextRequest } from 'next/server'
import { db } from '@/db'
import { otps } from '@/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { generateOTP, hashOTP } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'
import { successResponse, errorResponse, isValidEmail } from '@/lib/utils'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !isValidEmail(email)) {
      return errorResponse('Valid email is required', 400)
    }

    const normalizedEmail = email.toLowerCase().trim()

    const recentOTP = await db.query.otps.findFirst({
      where: and(
        eq(otps.email, normalizedEmail),
        gte(otps.createdAt, new Date(Date.now() - 60 * 1000))
      ),
    })

    if (recentOTP) {
      return errorResponse('Please wait 1 minute before requesting another OTP', 429)
    }

    const otp = generateOTP()
    const hashedOTP = await hashOTP(otp)

    await db.delete(otps).where(eq(otps.email, normalizedEmail))

    await db.insert(otps).values({
      email: normalizedEmail,
      code: hashedOTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    })

    const emailSent = await sendOTPEmail(normalizedEmail, otp)
    if (!emailSent) {
      return errorResponse('Failed to send OTP email. Please try again.', 500)
    }

    return successResponse({ message: 'OTP sent successfully' })
  } catch (error) {
    logger.error('Send OTP error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return errorResponse('Something went wrong', 500)
  }
}
