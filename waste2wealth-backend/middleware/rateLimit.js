// Lightweight per-IP limiter for single-instance deployments.
// For multiple replicas, replace this with a shared Redis-backed limiter.
const buckets = new Map();
function rateLimit({ windowMs = 15 * 60 * 1000, max = 10 } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const bucket = buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (bucket.count >= max) {
      res.set('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    }
    bucket.count += 1;
    return next();
  };
}
// Prevent unbounded memory consumption from stale client IPs.
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of buckets) if (now >= value.resetAt) buckets.delete(key);
}, 60 * 1000);
cleanup.unref?.();
module.exports = rateLimit;
