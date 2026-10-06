import { RATE_LIMIT } from '../config/index.js';

export function rateLimit({ windowMs = RATE_LIMIT.windowMs, max = RATE_LIMIT.max } = {}) {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [ip, times] of hits) {
      const fresh = times.filter((time) => now - time < windowMs);
      if (fresh.length === 0) hits.delete(ip);
      else hits.set(ip, fresh);
    }
  }, windowMs).unref();

  return function rateLimitMiddleware(req, res, next) {
    const ip = req.ip;
    const now = Date.now();

    const times = (hits.get(ip) ?? []).filter((time) => now - time < windowMs);
    times.push(now);
    hits.set(ip, times);

    req.rateLimit = {
      ip,
      count: times.length,
      limit: max,
      windowMs,
      resetAt: new Date(times[0] + windowMs).toISOString(),
    };

    if (times.length > max) {
      return res.status(429).json({
        error: {
          message: 'Слишком много запросов',
          details: [`с одного IP не больше ${max} запросов за ${windowMs / 1000} сек`],
          retryAfterMs: times[0] + windowMs - now,
        },
      });
    }

    next();
  };
}
