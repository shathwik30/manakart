import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import { verifyAuthToken } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  
  const origin = request.headers.get('origin') || '*'
  
  if (request.method === 'OPTIONS') {
    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    headers.set('Access-Control-Max-Age', '86400')
    
    return new NextResponse(null, { status: 200, headers })
  }

  const response = NextResponse.next()
  
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

  
  logger.info('API Request', {
    method: request.method,
    path: request.nextUrl.pathname,
    query: Object.fromEntries(request.nextUrl.searchParams),
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent'),
  })

  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    if (request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname.startsWith('/api/')) {
      return response
    }

    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const payload = await verifyAuthToken(token)

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
}
