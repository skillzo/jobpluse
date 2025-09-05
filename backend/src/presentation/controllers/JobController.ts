import { Request, Response } from "express";
import { JobRepository } from "../../domain/repositories/JobRepo";
import { IngestionService } from "../../domain/services/IngestionService";
import { CompanyRepository } from "../../domain/repositories/CompanyRepo";
import { LocationRepository } from "../../domain/repositories/LocationRepo";
import { SkillRepository } from "../../domain/repositories/SkillRepo";
import { ParsingService } from "../../domain/services/ParsingService";
import { CustomError } from "../../infrastructure/http/errorHandler";

export class JobController {
  private jobRepo: JobRepository;
  private ingestionService: IngestionService;

  constructor() {
    this.jobRepo = new JobRepository();
    const companyRepo = new CompanyRepository();
    const locationRepo = new LocationRepository();
    const skillRepo = new SkillRepository();
    const parsingService = new ParsingService();

    this.ingestionService = new IngestionService(
      this.jobRepo,
      companyRepo,
      locationRepo,
      skillRepo,
      parsingService
    );
  }

  async getJobs(req: Request, res: Response): Promise<void> {
    const {
      search,
      role,
      skill,
      location,
      remote,
      dateRange,
      salaryMin,
      salaryMax,
      page = "1",
      limit = "20",
    } = req.query;

    const filters = {
      search: search as string,
      role: role as string,
      skill: skill as string,
      location: location as string,
      remote: remote === "true" ? true : remote === "false" ? false : undefined,
      dateRange: dateRange
        ? this.parseDateRange(dateRange as string)
        : undefined,
      salaryMin: salaryMin ? parseFloat(salaryMin as string) : undefined,
      salaryMax: salaryMax ? parseFloat(salaryMax as string) : undefined,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };

    const result = await this.jobRepo.search(filters);
    res.json(result);
  }

  async getJobById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new CustomError("Job ID is required", 400);
    }

    const job = await this.jobRepo.findById(id);
    if (!job) {
      throw new CustomError("Job not found", 404);
    }

    res.json(job);
  }

  async syncJobs(req: Request, res: Response): Promise<void> {
    const result = await this.ingestionService.ingestFromRemoteOK();

    console.log("Sync completed", result);

    res.json({
      message: "Sync completed",
      result,
      timestamp: new Date().toISOString(),
    });
  }

  private parseDateRange(
    dateRange: string
  ): { start: Date; end: Date } | undefined {
    try {
      const [start, end] = dateRange.split("|");
      if (!start || !end) return undefined;

      return {
        start: new Date(start),
        end: new Date(end),
      };
    } catch {
      return undefined;
    }
  }
}
