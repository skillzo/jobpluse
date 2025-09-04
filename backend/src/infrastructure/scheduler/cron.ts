import cron from "node-cron";
import { logger } from "../logging/logger";
import { config } from "../../config/env";
import { IngestionService } from "../../domain/services/IngestionService";
import { TrendService } from "../../domain/services/TrendService";
import { JobRepository } from "../../domain/repositories/JobRepo";
import { CompanyRepository } from "../../domain/repositories/CompanyRepo";
import { LocationRepository } from "../../domain/repositories/LocationRepo";
import { SkillRepository } from "../../domain/repositories/SkillRepo";
import { ParsingService } from "../../domain/services/ParsingService";

export class Scheduler {
  private ingestionService: IngestionService;
  private trendService: TrendService;

  constructor() {
    const jobRepo = new JobRepository();
    const companyRepo = new CompanyRepository();
    const locationRepo = new LocationRepository();
    const skillRepo = new SkillRepository();
    const parsingService = new ParsingService();

    this.ingestionService = new IngestionService(
      jobRepo,
      companyRepo,
      locationRepo,
      skillRepo,
      parsingService
    );

    this.trendService = new TrendService();
  }

  start(): void {
    logger.info("Starting scheduler...");

    // Hourly job ingestion (every hour at minute 0)
    cron.schedule(
      config.CRON_SCHEDULE,
      async () => {
        logger.info("Running scheduled job ingestion...");
        try {
          const result = await this.ingestionService.ingestFromRemoteOK();
          logger.info(
            `Scheduled ingestion completed: ${result.inserted} inserted, ${result.updated} updated`
          );

          // Refresh materialized views after ingestion
          await this.trendService.refreshMaterializedViews();
          logger.info("Materialized views refreshed");
        } catch (error) {
          logger.error("Scheduled ingestion failed:", error);
        }
      },
      {
        scheduled: true,
        timezone: "UTC",
      }
    );

    // Daily maintenance tasks (at 2 AM UTC)
    cron.schedule(
      "0 2 * * *",
      async () => {
        logger.info("Running daily maintenance tasks...");
        try {
          // Mark inactive jobs
          const inactiveCount = await this.ingestionService.markInactiveJobs();
          logger.info(`Marked ${inactiveCount} jobs as inactive`);

          // Delete old jobs (every 7 days)
          const dayOfWeek = new Date().getDay();
          if (dayOfWeek === 0) {
            // Sunday
            const deletedCount = await this.ingestionService.deleteOldJobs();
            logger.info(`Deleted ${deletedCount} old jobs`);
          }

          // Refresh materialized views
          await this.trendService.refreshMaterializedViews();
          logger.info("Daily materialized views refresh completed");
        } catch (error) {
          logger.error("Daily maintenance tasks failed:", error);
        }
      },
      {
        scheduled: true,
        timezone: "UTC",
      }
    );

    // Log rotation (daily at 1 AM UTC)
    cron.schedule(
      "0 1 * * *",
      () => {
        logger.info("Running log rotation...");
        try {
          const { rotateLogs } = require("../logging/logger");
          rotateLogs();
        } catch (error) {
          logger.error("Log rotation failed:", error);
        }
      },
      {
        scheduled: true,
        timezone: "UTC",
      }
    );

    logger.info("Scheduler started successfully");
  }

  stop(): void {
    logger.info("Stopping scheduler...");
    // Note: node-cron doesn't have a built-in stop method
    // In a real application, you might want to store references to the cron jobs
    logger.info("Scheduler stopped");
  }
}
