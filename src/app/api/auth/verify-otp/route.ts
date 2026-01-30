import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyOTP, generateToken, setAuthCookie } from '@/lib/auth'
import { successResponse, errorResponse, isValidEmail } from '@/lib/utils'
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

    
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email: normalizedEmail,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!otpRecord) {
      return errorResponse('No OTP found. Please request a new one.', 400)
    }

    
    if (new Date() > otpRecord.expiresAt) {
      await prisma.oTP.delete({ where: { id: otpRecord.id } })
      return errorResponse('OTP has expired. Please request a new one.', 400)
    }

    
    if (otpRecord.attempts >= 3) {
      await prisma.oTP.delete({ where: { id: otpRecord.id } })
      return errorResponse('Too many attempts. Please request a new OTP.', 400)
    }

    
    const isValid = await verifyOTP(otp, otpRecord.code)

    if (!isValid) {
      
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      })
      return errorResponse('Invalid OTP. Please try again.', 400)
    }

    
    await prisma.oTP.delete({ where: { id: otpRecord.id } })

    
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    let isNewUser = false

    if (!user) {
      
      if (!name || !phone) {
        return errorResponse('Name and phone are required for new users', 400)
      }

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name.trim(),
          phone: phone.trim(),
        },
      })
      isNewUser = true
    }

    
    const token = generateToken({
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