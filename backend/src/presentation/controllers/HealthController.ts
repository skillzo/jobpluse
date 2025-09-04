import { Request, Response } from "express";
import { db } from "../../infrastructure/db";

export class HealthController {
  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      // Test database connection
      await db.execute("SELECT 1");

      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
      });
    } catch (error) {
      res.status(503).json({
        status: "error",
        message: "Database connection failed",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
