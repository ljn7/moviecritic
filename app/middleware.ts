import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key    '

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204 })
  }

  const token = request.cookies.get('token')?.value
  const authPaths = ['/add-movie', '/add-review', '/api/reviews']
  
  if (authPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    try {
      verify(token, JWT_SECRET)
      return response
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/add-movie',
    '/add-review',
    '/api/:path*' 
  ],
}