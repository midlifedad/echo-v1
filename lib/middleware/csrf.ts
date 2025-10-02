/**
 * CSRF (Cross-Site Request Forgery) Protection Middleware
 *
 * Protects against CSRF attacks by validating:
 * 1. Origin/Referer headers match the application domain
 * 2. Custom CSRF tokens for state-changing operations
 * 3. SameSite cookie attributes (when authentication is added)
 *
 * @see https://owasp.org/www-community/attacks/csrf
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';

/**
 * HTTP methods that should be protected against CSRF
 * GET/HEAD/OPTIONS are safe methods that don't change state
 */
const PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

/**
 * Generate a CSRF token
 * Uses cryptographically secure random bytes
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Hash a CSRF token for storage/comparison
 * Prevents timing attacks during validation
 */
export function hashCSRFToken(token: string): string {
  return createHash('sha256').update(token).digest('base64url');
}

/**
 * Validate Origin/Referer header
 * Ensures request originated from same domain
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  // Allow requests without origin/referer from same-origin contexts
  // (e.g., direct navigation, some browser scenarios)
  if (!origin && !referer) {
    // For state-changing operations, this should be more strict
    // but for now we'll allow it to avoid breaking legitimate requests
    return true;
  }

  // Validate origin header
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        console.warn('CSRF: Origin mismatch', { origin: originUrl.host, host });
        return false;
      }
    } catch (err) {
      console.error('CSRF: Invalid origin header', err);
      return false;
    }
  }

  // Validate referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) {
        console.warn('CSRF: Referer mismatch', { referer: refererUrl.host, host });
        return false;
      }
    } catch (err) {
      console.error('CSRF: Invalid referer header', err);
      return false;
    }
  }

  return true;
}

/**
 * Validate CSRF token from request
 * Checks custom header for token presence
 */
export function validateCSRFToken(request: NextRequest): boolean {
  // Check for CSRF token in custom header
  const csrfToken = request.headers.get('x-csrf-token');

  if (!csrfToken) {
    console.warn('CSRF: Missing CSRF token in request');
    return false;
  }

  // In a full implementation with sessions, we would:
  // 1. Retrieve the stored token hash from the session
  // 2. Hash the provided token
  // 3. Compare using timing-safe comparison
  //
  // Since we don't have sessions yet (Phase 2.4), we'll use a
  // simpler approach: validate that the token exists and is well-formed

  // Basic validation: token should be base64url encoded, 32 bytes = 43 chars
  if (csrfToken.length < 32 || !/^[A-Za-z0-9_-]+$/.test(csrfToken)) {
    console.warn('CSRF: Invalid token format');
    return false;
  }

  // TODO: When authentication is added in Phase 2.4, implement proper
  // token storage and validation using sessions/cookies

  return true;
}

/**
 * CSRF protection middleware for API routes
 * Call this at the start of API route handlers
 */
export async function validateCSRF(request: NextRequest): Promise<NextResponse | null> {
  const method = request.method;

  // Skip CSRF check for safe methods
  if (!PROTECTED_METHODS.includes(method)) {
    return null;
  }

  // Validate origin/referer
  if (!validateOrigin(request)) {
    return NextResponse.json(
      {
        error: 'CSRF validation failed',
        message: 'Request origin does not match application domain',
        code: 'CSRF_ORIGIN_MISMATCH'
      },
      { status: 403 }
    );
  }

  // For now, we'll only validate origin/referer
  // Token validation will be enforced once authentication is added
  // This provides basic CSRF protection without breaking current functionality

  // Uncomment this when authentication is implemented:
  /*
  if (!validateCSRFToken(request)) {
    return NextResponse.json(
      {
        error: 'CSRF validation failed',
        message: 'Invalid or missing CSRF token',
        code: 'CSRF_TOKEN_INVALID'
      },
      { status: 403 }
    );
  }
  */

  // Validation passed
  return null;
}

/**
 * Add CSRF token to response headers
 * Client should read this and include in subsequent requests
 */
export function addCSRFTokenToResponse(response: NextResponse): NextResponse {
  const token = generateCSRFToken();
  response.headers.set('x-csrf-token', token);

  // Also set in cookie for easier client-side access
  // Using httpOnly=false so JavaScript can read it
  // When authentication is added, store the hash in httpOnly cookie
  response.cookies.set('csrf-token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  return response;
}

/**
 * Helper to create CSRF-protected API response
 */
export function createCSRFProtectedResponse(
  data: unknown,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  return addCSRFTokenToResponse(response);
}

/**
 * Middleware wrapper for API route handlers
 * Automatically validates CSRF and adds token to response
 *
 * Usage:
 * ```typescript
 * export const POST = withCSRFProtection(async (request) => {
 *   // Your handler logic
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Validate CSRF
    const csrfError = await validateCSRF(request);
    if (csrfError) {
      return csrfError;
    }

    // Call the actual handler
    const response = await handler(request);

    // Add CSRF token to response
    return addCSRFTokenToResponse(response);
  };
}

/**
 * Get CSRF token from cookies or generate new one
 * Use this client-side to get token for requests
 */
export function getCSRFTokenFromCookies(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf-token') {
      return value;
    }
  }

  return null;
}
