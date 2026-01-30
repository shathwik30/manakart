

import { logger } from '@/lib/logger'

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ADMIN_SECRET_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
] as const

const optionalEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'NEXT_PUBLIC_APP_URL',
] as const

export function validateEnv() {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.'
    )
  }

  
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }

  
  const missingOptional = optionalEnvVars.filter((v) => !process.env[v])
  if (missingOptional.length > 0) {
    logger.warn(
      `Optional environment variables not set: ${missingOptional.join(', ')}`
    )
  }
}


export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY!,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID!,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET!,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
}
