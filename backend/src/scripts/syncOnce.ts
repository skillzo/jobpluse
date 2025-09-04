import { initializeDatabase, closeDatabase } from "../infrastructure/db";
import { IngestionService } from "../domain/services/IngestionService";
import { JobRepository } from "../domain/repositories/JobRepo";
import { CompanyRepository } from "../domain/repositories/CompanyRepo";
import { LocationRepository } from "../domain/repositories/LocationRepo";
import { SkillRepository } from "../domain/repositories/SkillRepo";
import { ParsingService } from "../domain/services/ParsingService";
import { logger } from "../infrastructure/logging/logger";

async function syncOnce(): Promise<void> {
  try {
    logger.info("Starting one-time sync from RemoteOK...");

    // Initialize database
    await initializeDatabase();

    // Initialize services
    const jobRepo = new JobRepository();
    const companyRepo = new CompanyRepository();
    const locationRepo = new LocationRepository();
    const skillRepo = new SkillRepository();
    const parsingService = new ParsingService();

    const ingestionService = new IngestionService(
      jobRepo,
      companyRepo,
      locationRepo,
      skillRepo,
      parsingService
    );

    // Run ingestion
    const result = await ingestionService.ingestFromRemoteOK();

    logger.info("One-time sync completed successfully");
    logger.info(
      `Results: ${result.inserted} inserted, ${result.updated} updated, ${result.errors.length} errors`
    );

    if (result.errors.length > 0) {
      logger.warn("Errors encountered during sync:");
      result.errors.forEach((error) => logger.warn(`- ${error}`));
    }
  } catch (error) {
    logger.error("One-time sync failed:", error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Run the script
syncOnce();
