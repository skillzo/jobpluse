import { Repository } from "typeorm";
import { AppDataSource } from "../../infrastructure/db";
import { Job } from "../entities/Job";
import { Company } from "../entities/Company";
import { Location } from "../entities/Location";
import { Skill } from "../entities/Skill";

export interface SkillTrend {
  day: Date;
  job_count: number;
}

export interface TopCompany {
  id: string;
  name: string;
  job_count: number;
}

export interface TopLocation {
  id: string;
  city?: string;
  country?: string;
  raw: string;
  job_count: number;
}

export interface DashboardKPIs {
  newJobs24h: number;
  newJobs7d: number;
  totalActiveJobs: number;
  totalCompanies: number;
}

export class TrendService {
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

  async getDashboardKPIs(): Promise<DashboardKPIs> {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [newJobs24h, newJobs7d, totalActiveJobs, totalCompanies] =
      await Promise.all([
        this.getNewJobsCount(dayAgo),
        this.getNewJobsCount(weekAgo),
        this.getTotalActiveJobs(),
        this.getTotalCompanies(),
      ]);

    return {
      newJobs24h,
      newJobs7d,
      totalActiveJobs,
      totalCompanies,
    };
  }

  async getTopSkills(
    sinceDays: number,
    limit = 10
  ): Promise<{ id: string; name: string; job_count: number }[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - sinceDays);

    const result = await this.skillRepo
      .createQueryBuilder("skill")
      .select([
        "skill.id as id",
        "skill.name as name",
        "COUNT(DISTINCT job.id) as job_count",
      ])
      .innerJoin("skill.jobs", "job")
      .where("job.posted_at >= :sinceDate", { sinceDate })
      .andWhere("job.is_active = :isActive", { isActive: true })
      .groupBy("skill.id")
      .addGroupBy("skill.name")
      .orderBy("job_count", "DESC")
      .limit(limit)
      .getRawMany();

    return result.map((row) => ({
      id: row.id,
      name: row.name,
      job_count: parseInt(row.job_count),
    }));
  }

  async getSkillTrend(
    skillName: string,
    sinceDays: number
  ): Promise<SkillTrend[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - sinceDays);

    const result = await this.jobRepo
      .createQueryBuilder("job")
      .select([
        "DATE(job.posted_at) as day",
        "COUNT(DISTINCT job.id) as job_count",
      ])
      .innerJoin("job.skills", "skill")
      .where("skill.name = :skillName", { skillName })
      .andWhere("job.posted_at >= :sinceDate", { sinceDate })
      .andWhere("job.is_active = :isActive", { isActive: true })
      .groupBy("DATE(job.posted_at)")
      .orderBy("DATE(job.posted_at)")
      .getRawMany();

    return result.map((row) => ({
      day: new Date(row.day),
      job_count: parseInt(row.job_count),
    }));
  }

  async getTopCompanies(sinceDays: number, limit = 10): Promise<TopCompany[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - sinceDays);

    const result = await this.companyRepo
      .createQueryBuilder("company")
      .select([
        "company.id as id",
        "company.name as name",
        "COUNT(DISTINCT job.id) as job_count",
      ])
      .innerJoin("company.jobs", "job")
      .where("job.posted_at >= :sinceDate", { sinceDate })
      .andWhere("job.is_active = :isActive", { isActive: true })
      .groupBy("company.id")
      .addGroupBy("company.name")
      .orderBy("job_count", "DESC")
      .limit(limit)
      .getRawMany();

    return result.map((row) => ({
      id: row.id,
      name: row.name,
      job_count: parseInt(row.job_count),
    }));
  }

  async getTopLocations(sinceDays: number, limit = 10): Promise<TopLocation[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - sinceDays);

    const result = await this.locationRepo
      .createQueryBuilder("location")
      .select([
        "location.id as id",
        "location.city as city",
        "location.country as country",
        "location.raw as raw",
        "COUNT(DISTINCT job.id) as job_count",
      ])
      .innerJoin("location.jobs", "job")
      .where("job.posted_at >= :sinceDate", { sinceDate })
      .andWhere("job.is_active = :isActive", { isActive: true })
      .groupBy("location.id")
      .addGroupBy("location.city")
      .addGroupBy("location.country")
      .addGroupBy("location.raw")
      .orderBy("job_count", "DESC")
      .limit(limit)
      .getRawMany();

    return result.map((row) => ({
      id: row.id,
      city: row.city,
      country: row.country,
      raw: row.raw,
      job_count: parseInt(row.job_count),
    }));
  }

  async refreshMaterializedViews(): Promise<void> {
    // Use query runner for raw SQL
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      await queryRunner.query(
        "REFRESH MATERIALIZED VIEW mv_skill_counts_daily"
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async getNewJobsCount(sinceDate: Date): Promise<number> {
    return await this.jobRepo.count({
      where: {
        posted_at: { $gte: sinceDate } as any,
        is_active: true,
      },
    });
  }

  private async getTotalActiveJobs(): Promise<number> {
    return await this.jobRepo.count({
      where: { is_active: true },
    });
  }

  private async getTotalCompanies(): Promise<number> {
    return await this.companyRepo.count();
  }
}
