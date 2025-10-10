/**
 * Simple in-memory rate limiter for feedback submissions
 * Tracks submissions by IP address with configurable time windows
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store for rate limiting (IP -> submission data)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically (every 10 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(ip);
      }
    }
  }, 10 * 60 * 1000);
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request from the given IP is allowed under rate limits
 *
 * @param ip - Client IP address
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export function checkRateLimit(ip: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // No previous entry or window expired - allow and create new entry
  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(ip, {
      count: 1,
      resetAt
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt
    };
  }

  // Entry exists and window is active
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt
    };
  }

  // Increment count and allow
  entry.count++;
  rateLimitStore.set(ip, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt
  };
}

/**
 * Get client IP from request, handling proxies
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers (in order of precedence)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to a default (shouldn't happen in production with proper proxy setup)
  return 'unknown';
}
