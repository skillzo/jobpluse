import { RateLimiterMemory } from "rate-limiter-flexible";
import { Request, Response, NextFunction } from "express";

export interface RateLimitOptions {
  points: number; // Number of requests
  duration: number; // Time window in seconds
  blockDuration?: number; // Block duration in seconds
}

export class RateLimiter {
  private limiter: RateLimiterMemory;

  constructor(options: RateLimitOptions) {
    this.limiter = new RateLimiterMemory({
      points: options.points,
      duration: options.duration,
      blockDuration: options.blockDuration || options.duration,
    });
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.getClientKey(req);
        await this.limiter.consume(key);
        next();
      } catch (rejRes) {
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        res.set("Retry-After", String(secs));
        res.status(429).json({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: secs,
        });
      }
    };
  }

  private getClientKey(req: Request): string {
    // Use IP address as key, fallback to user agent
    return (
      req.ip ||
      (req.headers["x-forwarded-for"] as string) ||
      (req.headers["user-agent"] as string) ||
      "unknown"
    );
  }
}

// Create rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter({
  points: 100, // 100 requests
  duration: 600, // per 10 minutes
});

export const adminRateLimiter = new RateLimiter({
  points: 10, // 10 requests
  duration: 600, // per 10 minutes
});
