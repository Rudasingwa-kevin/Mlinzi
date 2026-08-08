/**
 * In-memory sliding window rate limiter.
 *
 * Tracks request counts per key (IP, phone number, etc.)
 * and rejects requests that exceed the configured limit
 * within the time window.
 *
 * No external dependencies (Redis, etc.) required.
 */

const store = new Map();

// Periodic cleanup every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.windowStart > entry.windowMs * 2) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiter factory.
 *
 * @param {Object} opts
 * @param {number} opts.windowMs   - Time window in milliseconds (default: 60 000 = 1 min)
 * @param {number} opts.max        - Max requests per window (default: 10)
 * @param {Function} opts.keyGenerator - Function that returns the rate-limit key (default: req IP)
 * @param {string}   opts.message  - Custom error message
 * @param {Function} opts.skip     - Function returning true to skip rate limiting
 * @returns Express middleware
 */
function rateLimit({
  windowMs = 60_000,
  max = 10,
  keyGenerator = (req) => req.ip || req.connection?.remoteAddress || "unknown",
  message = "Too many requests. Please try again later.",
  skip = () => false,
} = {}) {
  return function rateLimitMiddleware(req, res, next) {
    if (skip(req)) return next();

    const key = keyGenerator(req);
    const now = Date.now();

    let entry = store.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      // Start a new window
      entry = { windowStart: now, count: 0 };
      store.set(key, entry);
    }

    entry.count += 1;

    const remaining = Math.max(0, max - entry.count);
    const resetTime = Math.ceil((entry.windowStart + windowMs) / 1000);

    // Set standard rate-limit headers
    res.set("X-RateLimit-Limit", String(max));
    res.set("X-RateLimit-Remaining", String(remaining));
    res.set("X-RateLimit-Reset", String(resetTime));

    if (entry.count > max) {
      const retryAfterSec = Math.ceil((entry.windowStart + windowMs - now) / 1000);
      res.set("Retry-After", String(retryAfterSec));

      return res.status(429).json({
        error: message,
        retryAfter: retryAfterSec,
      });
    }

    next();
  };
}

// Pre-configured limiters for common use cases

/** SMS/WhatsApp webhooks – strict: 30 requests per minute per phone */
const channelLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  keyGenerator: (req) => {
    const phone = req.body?.from || req.body?.phone_number || req.ip;
    return `channel:${phone}`;
  },
  message: "Too many messages from this number. Please wait before sending again.",
});

/** Report submissions – moderate: 10 per minute per IP */
const reportLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  keyGenerator: (req) => `report:${req.ip}`,
  message: "Too many reports submitted. Please wait before trying again.",
});

/** Escalation (referral) – strict: 5 per minute per IP */
const escalationLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  keyGenerator: (req) => `escalate:${req.ip}`,
  message: "Too many referral requests. Please wait before trying again.",
});

/** Auth endpoints – brute-force protection: 5 attempts per 15 minutes */
const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 5,
  keyGenerator: (req) => `auth:${req.ip}`,
  message: "Too many login attempts. Please try again in 15 minutes.",
});

/** General API – generous: 60 requests per minute per IP */
const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  keyGenerator: (req) => `api:${req.ip}`,
  message: "Rate limit exceeded. Please slow down.",
});

module.exports = {
  rateLimit,
  channelLimiter,
  reportLimiter,
  escalationLimiter,
  authLimiter,
  apiLimiter,
};
