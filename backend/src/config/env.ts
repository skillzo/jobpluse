import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("4000"),
  DATABASE_URL: z.string().url(),
  REMOTEOK_API_URL: z.string().url().default("https://remoteok.com/api"),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:5173"),
  CRON_SCHEDULE: z.string().default("0 * * * *"), // hourly
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

const env = envSchema.parse(process.env);

export const config = {
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  DATABASE_URL: env.DATABASE_URL,
  REMOTEOK_API_URL: env.REMOTEOK_API_URL,
  FRONTEND_ORIGIN: env.FRONTEND_ORIGIN,
  CRON_SCHEDULE: env.CRON_SCHEDULE,
  LOG_LEVEL: env.LOG_LEVEL,
  IS_DEV: env.NODE_ENV === "development",
  IS_PROD: env.NODE_ENV === "production",
  IS_TEST: env.NODE_ENV === "test",
} as const;
