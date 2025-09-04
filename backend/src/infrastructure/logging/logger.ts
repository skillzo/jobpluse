import pino from "pino";
import { config } from "../../config/env";
import path from "path";

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");

// Configure pino logger
export const logger = pino(
  {
    level: config.LOG_LEVEL,
    transport: config.IS_DEV
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  config.IS_DEV
    ? undefined
    : pino.destination({
        dest: path.join(logsDir, "app.log"),
        sync: false,
      })
);

// Create a child logger for HTTP requests
export const createRequestLogger = (requestId: string) => {
  return logger.child({ requestId });
};

// Log rotation (simple daily rotation)
export const rotateLogs = (): void => {
  const fs = require("fs");
  const currentDate = new Date().toISOString().split("T")[0];
  const currentLogPath = path.join(logsDir, "app.log");
  const rotatedLogPath = path.join(logsDir, `app.${currentDate}.log`);

  if (fs.existsSync(currentLogPath)) {
    try {
      fs.renameSync(currentLogPath, rotatedLogPath);
      logger.info("Log file rotated successfully");
    } catch (error) {
      logger.error("Failed to rotate log file:", error);
    }
  }
};
