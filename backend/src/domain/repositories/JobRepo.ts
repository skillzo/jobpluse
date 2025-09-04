import {
  Repository,
  Like,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from "typeorm";
import { AppDataSource } from "../../infrastructure/db";
import { Job, PayPeriod } from "../entities/Job";
import { Company } from "../entities/Company";
import { Location } from "../entities/Location";
import { Skill } from "../entities/Skill";

export interface JobFilters {
  search?: string;
  role?: string;
  skill?: string;
  location?: string;
  remote?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
}

export interface JobSearchResult {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class JobRepository {
  private jobRepo: Repository<Job>;
  private companyRepo: Repository<Company>;
  private locationRepo: Repository<Location>;
  private skillRepo: Repository<Skill>;

  constructor() {
    this.jobRepo = AppDataSource.getRepository(Job);
    this.companyRepo = AppDataSource.getRepository(Company);
    this.locationRepo = AppDataSource.getRepository(Location);
    this.skillRepo = AppDataSource.getRepository(Skill);
  }

  async findById(id: string): Promise<Job | null> {
    return await this.jobRepo.findOne({
      where: { id },
      relations: ["company", "location", "skills"],
    });
  }

  async findByExternalId(externalId: string): Promise<Job | null> {
    return await this.jobRepo.findOne({
      where: { external_id: externalId },
    });
  }

  async search(filters: JobFilters): Promise<JobSearchResult> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = { is_active: true };

    if (filters.role) {
      whereConditions.title = Like(`%${filters.role}%`);
    }

    if (filters.remote !== undefined) {
      whereConditions.remote = filters.remote;
    }

    if (filters.dateRange) {
      whereConditions.posted_at = Between(
        filters.dateRange.start,
        filters.dateRange.end
      );
    }

    if (filters.salaryMin) {
      whereConditions.min_salary = MoreThanOrEqual(filters.salaryMin);
    }

    if (filters.salaryMax) {
      whereConditions.max_salary = LessThanOrEqual(filters.salaryMax);
    }

    // Get total count
    const total = await this.jobRepo.count({ where: whereConditions });

    // Get jobs with relations
    const jobs = await this.jobRepo.find({
      where: whereConditions,
      relations: ["company", "location", "skills"],
      order: { posted_at: "DESC" },
      skip: offset,
      take: limit,
    });

    // Filter by skill if specified
    let filteredJobs = jobs;
    if (filters.skill) {
      filteredJobs = jobs.filter((job) =>
        job.skills?.some((skill) =>
          skill.name.toLowerCase().includes(filters.skill!.toLowerCase())
        )
      );
    }

    // Filter by location if specified
    if (filters.location) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.location?.raw
            .toLowerCase()
            .includes(filters.location!.toLowerCase()) ||
          job.location?.city
            ?.toLowerCase()
            .includes(filters.location!.toLowerCase()) ||
          job.location?.country
            ?.toLowerCase()
            .includes(filters.location!.toLowerCase())
      );
    }

    // Handle search vector if specified
    if (filters.search) {
      // For now, filter by title and description content
      // You can implement full-text search later using PostgreSQL's tsvector
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
          job.description_md
            ?.toLowerCase()
            .includes(filters.search!.toLowerCase())
      );
    }

    return {
      jobs: filteredJobs,
      total: filteredJobs.length,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(
    jobData: Omit<Job, "id" | "created_at" | "updated_at">
  ): Promise<Job> {
    const job = this.jobRepo.create({
      ...jobData,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await this.jobRepo.save(job);
  }

  async upsert(
    jobData: Omit<Job, "id" | "created_at" | "updated_at">
  ): Promise<Job> {
    const existingJob = await this.findByExternalId(jobData.external_id);

    if (existingJob) {
      // Update existing job
      Object.assign(existingJob, {
        ...jobData,
        last_seen_at: new Date(),
        updated_at: new Date(),
      });
      return await this.jobRepo.save(existingJob);
    } else {
      // Create new job
      return await this.create(jobData);
    }
  }

  async updateLastSeen(externalId: string): Promise<void> {
    await this.jobRepo.update(
      { external_id: externalId },
      {
        last_seen_at: new Date(),
        updated_at: new Date(),
      }
    );
  }

  async markInactive(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.jobRepo.update(
      { is_active: true, last_seen_at: LessThanOrEqual(cutoffDate) },
      {
        is_active: false,
        updated_at: new Date(),
      }
    );

    return result.affected || 0;
  }

  async deleteOldJobs(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.jobRepo.delete({
      created_at: LessThanOrEqual(cutoffDate),
    });

    return result.affected || 0;
  }
}
