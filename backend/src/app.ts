import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config } from "./config/env";
import { logger } from "./infrastructure/logging/logger";
import { createRoutes } from "./infrastructure/http/routes";
import {
  errorHandler,
  notFoundHandler,
} from "./infrastructure/http/errorHandler";
import { Scheduler } from "./infrastructure/scheduler/cron";

export function createApp(): express.Application {
  const app = express();

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: config.IS_DEV
        ? false
        : {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'"],
              imgSrc: ["'self'", "data:", "https:"],
            },
          },
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: config.IS_DEV
        ? [
            config.FRONTEND_ORIGIN,
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:4173",
          ]
        : config.FRONTEND_ORIGIN,
      credentials: false,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
        "X-Request-ID",
        "Cache-Control",
        "X-Forwarded-For",
        "X-Real-IP",
      ],
      exposedHeaders: ["X-Request-ID", "ETag", "Cache-Control"],
      optionsSuccessStatus: 200,
      preflightContinue: false,
    })
  );

  // Additional CORS headers for all responses
  app.use((req, res, next) => {
    // Log CORS-related headers for debugging
    if (config.IS_DEV) {
      logger.info({
        message: "CORS Debug",
        origin: req.headers.origin,
        method: req.method,
        url: req.url,
        headers: req.headers,
      });
    }

    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Request-ID, Cache-Control, X-Forwarded-For, X-Real-IP"
    );
    res.header(
      "Access-Control-Expose-Headers",
      "X-Request-ID, ETag, Cache-Control"
    );
    next();
  });

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    res.setHeader("X-Request-ID", requestId);

    logger.info({
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.on("finish", () => {
      const duration = Date.now() - start;
      logger.info({
        requestId,
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  });

  // Health check endpoint (before routes)
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API routes
  app.use("/", createRoutes());

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

export function startScheduler(): void {
  if (config.IS_PROD) {
    const scheduler = new Scheduler();
    scheduler.start();
  }
}
