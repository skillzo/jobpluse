import { Router, Request, Response } from "express";
import etag from "etag";
import { apiCache, analyticsCache } from "./cache";
import { apiRateLimiter, adminRateLimiter } from "./rateLimit";
import { asyncHandler } from "./errorHandler";
import { HealthController } from "../../presentation/controllers/HealthController";
import { JobController } from "../../presentation/controllers/JobController";
import { AnalyticsController } from "../../presentation/controllers/AnalyticsController";

export function createRoutes(): Router {
  const router = Router();

  // Initialize controllers
  const healthController = new HealthController();
  const jobController = new JobController();
  const analyticsController = new AnalyticsController();

  // Health check
  router.get(
    "/health",
    asyncHandler(healthController.getHealth.bind(healthController))
  );

  // Admin routes
  router.post(
    "/admin/sync",
    adminRateLimiter.middleware(),
    asyncHandler(jobController.syncJobs.bind(jobController))
  );

  // Job routes
  router.get(
    "/jobs",
    apiRateLimiter.middleware(),
    asyncHandler(jobController.getJobs.bind(jobController))
  );
  router.get(
    "/jobs/:id",
    apiRateLimiter.middleware(),
    asyncHandler(jobController.getJobById.bind(jobController))
  );

  // Analytics routes
  router.get(
    "/skills/top",
    apiRateLimiter.middleware(),
    asyncHandler(analyticsController.getTopSkills.bind(analyticsController))
  );
  router.get(
    "/trends/skill/:name",
    apiRateLimiter.middleware(),
    asyncHandler(analyticsController.getSkillTrend.bind(analyticsController))
  );
  router.get(
    "/companies/top",
    apiRateLimiter.middleware(),
    asyncHandler(analyticsController.getTopCompanies.bind(analyticsController))
  );
  router.get(
    "/locations/top",
    apiRateLimiter.middleware(),
    asyncHandler(analyticsController.getTopLocations.bind(analyticsController))
  );

  return router;
}

// Cache middleware
export function cacheMiddleware(cache: typeof apiCache, ttl?: number) {
  return async (req: Request, res: Response, next: Function) => {
    const key = cache.generateKey(req.path, req.query);
    const cached = cache.get(key);

    if (cached) {
      const etagValue = etag(JSON.stringify(cached));
      res.set("ETag", etagValue);
      res.set(
        "Cache-Control",
        `public, max-age=${Math.floor((ttl || 60000) / 1000)}`
      );

      if (req.headers["if-none-match"] === etagValue) {
        return res.status(304).end();
      }

      return res.json(cached);
    }

    const originalSend = res.json;
    res.json = function (data: any) {
      cache.set(key, data, ttl);
      const etagValue = etag(JSON.stringify(data));
      res.set("ETag", etagValue);
      res.set(
        "Cache-Control",
        `public, max-age=${Math.floor((ttl || 60000) / 1000)}`
      );
      return originalSend.call(this, data);
    };

    next();
  };
}
