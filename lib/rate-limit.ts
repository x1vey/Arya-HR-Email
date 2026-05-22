/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Works per serverless instance — provides real protection during sustained
 * traffic and is supplemented by client-side quota tracking in the UI.
 * For production, swap the Map for Vercel KV / Upstash Redis.
 */

const store = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  /** ms until the oldest request in the window expires */
  resetMs: number;
}

/**
 * Check and record a request against the rate limit.
 *
 * @param key      Unique identifier (IP, user id, API key hash, etc.)
 * @param limit    Max requests allowed in the window
 * @param windowMs Window size in milliseconds (default 24 h)
 */
export function checkRateLimit(
  key: string,
  limit = 20,
  windowMs = 24 * 60 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  // Keep only timestamps inside the current window
  const timestamps = (store.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      resetMs: timestamps[0] + windowMs - now,
    };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  return {
    allowed: true,
    remaining: limit - timestamps.length,
    limit,
    resetMs: timestamps[0] + windowMs - now,
  };
}

// Periodic cleanup — prevent unbounded growth
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const [key, ts] of store) {
      const live = ts.filter((t) => t > cutoff);
      if (live.length === 0) store.delete(key);
      else store.set(key, live);
    }
  }, 10 * 60 * 1000); // every 10 min
}
