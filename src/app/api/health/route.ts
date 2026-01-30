import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  environment: string
  version: string
  checks: {
    database: {
      status: 'connected' | 'disconnected'
      latency?: number
    }
  }
}

export async function GET() {
  const startTime = Date.now()
  
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '0.1.0',
    checks: {
      database: {
        status: 'disconnected',
      },
    },
  }

  
  try {
    const dbStartTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    response.checks.database = {
      status: 'connected',
      latency: Date.now() - dbStartTime,
    }
  } catch (error) {
    response.status = 'unhealthy'
    response.checks.database = {
      status: 'disconnected',
    }
    logger.error('Health check database error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  const statusCode = response.status === 'healthy' ? 200 : 503

  logger.info('Health check completed', {
    status: response.status,
    latency: Date.now() - startTime,
  })

  return NextResponse.json(response, { status: statusCode })
}
