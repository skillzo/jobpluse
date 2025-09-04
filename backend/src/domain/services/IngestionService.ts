import axios from "axios";
import { Repository } from "typeorm";
import { config } from "../../config/env";
import { logger } from "../../infrastructure/logging/logger";
import { AppDataSource } from "../../infrastructure/db";
import { Ingestion, IngestionStatus } from "../entities/Ingestion";
import { JobRepository } from "../repositories/JobRepo";
import { CompanyRepository } from "../repositories/CompanyRepo";
import { LocationRepository } from "../repositories/LocationRepo";
import { SkillRepository } from "../repositories/SkillRepo";
import { ParsingService } from "./ParsingService";

export interface RemoteOKJob {
  id: string;
  position: string;
  company: string;
  location: string;
  description: string;
  url: string;
  tags: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;
  created: number;
  slug: string;
}

export interface IngestionResult {
  inserted: number;
  updated: number;
  errors: string[];
}

export class IngestionService {
  private ingestionRepo: Repository<Ingestion>;

  constructor(
    private jobRepo: JobRepository,
    private companyRepo: CompanyRepository,
    private locationRepo: LocationRepository,
    private skillRepo: SkillRepository,
    private parsingService: ParsingService
  ) {
    this.ingestionRepo = AppDataSource.getRepository(Ingestion);
  }

  async ingestFromRemoteOK(): Promise<IngestionResult> {
    const result: IngestionResult = { inserted: 0, updated: 0, errors: [] };

    try {
      logger.info("Starting RemoteOK ingestion...");

      // Fetch data from RemoteOK API
      const response = await axios.get<RemoteOKJob[]>(config.REMOTEOK_API_URL, {
        headers: {
          "User-Agent":
            "JobPulse/1.0 (https://github.com/jobpulse; jobpulse@example.com)",
        },
        timeout: 30000,
      });

      const jobs = response.data;
      logger.info(`Fetched ${jobs.length} jobs from RemoteOK`);

      // Process each job
      for (const remoteJob of jobs) {
        try {
          await this.processJob(remoteJob, result);
        } catch (error) {
          const errorMsg = `Error processing job ${remoteJob.id}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          logger.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      // Log ingestion result
      await this.logIngestionResult(result);

      logger.info(
        `Ingestion completed: ${result.inserted} inserted, ${result.updated} updated, ${result.errors.length} errors`
      );
    } catch (error) {
      const errorMsg = `Failed to ingest from RemoteOK: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      logger.error(errorMsg);
      result.errors.push(errorMsg);

      // Log failed ingestion
      await this.logIngestionResult(result, "error", errorMsg);
    }

    return result;
  }

  private async processJob(
    remoteJob: RemoteOKJob,
    result: IngestionResult
  ): Promise<void> {
    // Check if job already exists
    const existingJob = await this.jobRepo.findByExternalId(remoteJob.id);

    // Parse job data
    const parsedSalary = this.parsingService.parseSalary(remoteJob.description);
    const parsedLocation = this.parsingService.parseLocation(
      remoteJob.location
    );
    const skills = this.parsingService.extractSkills(
      remoteJob.position,
      remoteJob.description
    );
    const contentHash = this.parsingService.generateContentHash(
      remoteJob.position,
      remoteJob.description,
      parsedSalary
    );

    // Truncate description to 20KB
    const truncatedDescription =
      remoteJob.description.length > 20000
        ? remoteJob.description.substring(0, 20000) + "..."
        : remoteJob.description;

    // Upsert company
    const company = await this.companyRepo.upsert(remoteJob.company);

    // Upsert location
    const location = await this.locationRepo.upsert(parsedLocation);

    // Prepare job data
    const jobData = {
      external_id: remoteJob.id,
      source: "remoteok",
      title: remoteJob.position,
      company_id: company.id,
      location_id: location.id,
      url: remoteJob.url,
      description_md: truncatedDescription,
      posted_at: new Date(remoteJob.created * 1000),
      remote: true, // RemoteOK jobs are typically remote
      min_salary: parsedSalary.min_salary,
      max_salary: parsedSalary.max_salary,
      currency: parsedSalary.currency,
      pay_period: parsedSalary.pay_period,
      content_hash: contentHash,
      is_active: true,
      last_seen_at: new Date(),
    };

    if (existingJob) {
      // Update existing job
      await this.jobRepo.upsert(jobData);
      result.updated++;
    } else {
      // Create new job
      const newJob = await this.jobRepo.create(jobData);

      // Add skills to job
      await this.skillRepo.addSkillsToJob(newJob.id, skills);

      result.inserted++;
    }
  }

  private async logIngestionResult(
    result: IngestionResult,
    status: IngestionStatus = IngestionStatus.SUCCESS,
    errorText?: string
  ): Promise<void> {
    const ingestion = this.ingestionRepo.create({
      source: "remoteok",
      ran_at: new Date(),
      count_inserted: result.inserted,
      count_updated: result.updated,
      status: status,
      error_text: errorText,
    });
    await this.ingestionRepo.save(ingestion);
  }

  async markInactiveJobs(): Promise<number> {
    logger.info("Marking inactive jobs...");
    const count = await this.jobRepo.markInactive(7); // 7 days
    logger.info(`Marked ${count} jobs as inactive`);
    return count;
  }

  async deleteOldJobs(): Promise<number> {
    logger.info("Deleting old jobs...");
    const count = await this.jobRepo.deleteOldJobs(180); // 180 days
    logger.info(`Deleted ${count} old jobs`);
    return count;
  }
}
