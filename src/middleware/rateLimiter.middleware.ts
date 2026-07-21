import type { Request, Response, NextFunction } from "express";
import redis from "../config/redis.js";

const WHITELIST: string[] = ["127.0.0.1", "::1"];

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

const rateLimiter = (options: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const normalizedIp = ip === "::1" ? "127.0.0.1" : ip;

    if (WHITELIST.includes(normalizedIp as string)) {
      console.log(`IP ${normalizedIp} is whitelisted. Skipping rate limiting.`);
      next();
      return;
    }

    const key = `rate_limit:${normalizedIp}`;
    const now = Date.now();
    const windowStart = now - options.windowMs * 1000;

    const pipeline = redis.pipeline();

    pipeline.zremrangebyscore(key, 0, windowStart);

    pipeline.zcard(key);

    pipeline.zadd(key, now, now.toString());

    pipeline.expire(key, options.windowMs);

    const results = await pipeline.exec();

    const requestCount = (results?.[1]?.[1] as number) ?? 0;

    const remaining = Math.max(options.maxRequests - requestCount - 1, 0);
    const resetTime = now + options.windowMs * 1000;

    res.setHeader("X-RateLimit-Limit", options.maxRequests.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());
    res.setHeader("X-RateLimit-Reset", resetTime.toString());

    if (requestCount >= options.maxRequests) {

      const oldestRequest = await redis.zrange(key, 0, 0, "WITHSCORES");
      const oldestTimestamp = oldestRequest[1] ? parseInt(oldestRequest[1]) : now;
      const retryAfter = Math.ceil((oldestTimestamp + options.windowMs * 1000 - now) / 1000);

      res.setHeader("Retry-After", retryAfter.toString());
      res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter,
        requestMade: requestCount,
        limit: options.maxRequests,
      });
      return;
    }

    next();
  };
};

export default rateLimiter;