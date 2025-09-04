import { Request, Response, NextFunction } from "express";
import { logger, createRequestLogger } from "../logging/logger";
import { config } from "../../config/env";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestLogger = createRequestLogger(
    (req.headers["x-request-id"] as string) || "unknown"
  );

  // Log error
  requestLogger.error({
    error: error.message,
    stack: config.IS_DEV ? error.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // Determine status code
  const statusCode = error.statusCode || 500;

  // Create error response
  const errorResponse: any = {
    error: error.message || "Internal Server Error",
    statusCode,
  };

  // Add stack trace in development
  if (config.IS_DEV && error.stack) {
    errorResponse.stack = error.stack;
  }

  // Handle specific error types
  if (error.name === "ValidationError") {
    errorResponse.statusCode = 400;
    errorResponse.error = "Validation Error";
  } else if (error.name === "CastError") {
    errorResponse.statusCode = 400;
    errorResponse.error = "Invalid ID format";
  } else if (error.code === "23505") {
    // PostgreSQL unique constraint violation
    errorResponse.statusCode = 409;
    errorResponse.error = "Resource already exists";
  } else if (error.code === "23503") {
    // PostgreSQL foreign key constraint violation
    errorResponse.statusCode = 400;
    errorResponse.error = "Invalid reference";
  }

  res.status(errorResponse.statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
    statusCode: 404,
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
