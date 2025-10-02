/**
 * Next.js Middleware
 * Runs on all requests before reaching route handlers
 *
 * This middleware:
 * 1. Adds security headers to all responses
 * 2. Validates CSRF for API routes
 * 3. Provides CSRF tokens to clients
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateCSRF, addCSRFTokenToResponse } from '@/lib/middleware/csrf';

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection in older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  // Note: This is a basic CSP. Adjust based on your needs.
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-inline needed for Next.js
    "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for styled-components
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an API route
  const isApiRoute = pathname.startsWith('/api/');

  if (isApiRoute) {
    // Validate CSRF for API routes with state-changing methods
    const csrfError = await validateCSRF(request);
    if (csrfError) {
      return addSecurityHeaders(csrfError);
    }
  }

  // Continue to route handler
  const response = NextResponse.next();

  // Add security headers to all responses
  const secureResponse = addSecurityHeaders(response);

  // Add CSRF token to response (for client to use in next request)
  const finalResponse = addCSRFTokenToResponse(secureResponse);

  return finalResponse;
}

/**
 * Configure which routes this middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
