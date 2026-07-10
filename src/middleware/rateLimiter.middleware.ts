
import redisClient from "../config/redis.js";
import type { Request, Response, NextFunction } from "express";

const WISHLIST_IP: string[] = ["127.0.0.1", "::1"];

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

const rateLimiter = (options: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const normalizeip = ip === "::1" ? "127.0.0.1" : ip;

    if (WISHLIST_IP.includes(normalizeip as unknown as string)) {
      next();
      return;
    }

    const key = `rate-limit:${normalizeip}`;
    const requests = await redisClient.incr(key);

    if (requests === 1) {
      await redisClient.expire(key, options.windowMs);
    }

    const ttl = await redisClient.ttl(key);

    res.setHeader("X-RateLimit-Limit", options.maxRequests.toString());
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(options.maxRequests - requests, 0).toString(),
    );

    res.setHeader("Retry-After", ttl);

    if(requests > options.maxRequests) {
        return res.status(429).json({
            success: false,
            message: "Too many requests, please try again later.",
            retryAfter: ttl,
            limit: options.maxRequests,
            requestMade: requests   
        });
    }

    next();
  };
};

export default rateLimiter;