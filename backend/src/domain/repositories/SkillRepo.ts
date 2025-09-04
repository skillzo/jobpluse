import { Repository, Like } from "typeorm";
import { AppDataSource } from "../../infrastructure/db";
import { Skill } from "../entities/Skill";
import { Job } from "../entities/Job";
import { JobSkill } from "../entities/JobSkill";

export interface TopSkill {
  id: string;
  name: string;
  job_count: number;
}

export class SkillRepository {
  private skillRepo: Repository<Skill>;
  private jobRepo: Repository<Job>;
  private jobSkillRepo: Repository<JobSkill>;

  constructor() {
    this.skillRepo = AppDataSource.getRepository(Skill);
    this.jobRepo = AppDataSource.getRepository(Job);
    this.jobSkillRepo = AppDataSource.getRepository(JobSkill);
  }

  async findById(id: string): Promise<Skill | null> {
    return await this.skillRepo.findOne({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Skill | null> {
    return await this.skillRepo.findOne({
      where: { name },
    });
  }

  async create(name: string): Promise<Skill> {
    const skill = this.skillRepo.create({
      name,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await this.skillRepo.save(skill);
  }

  async upsert(name: string): Promise<Skill> {
    const existingSkill = await this.findByName(name);

    if (existingSkill) {
      // Update existing skill
      existingSkill.updated_at = new Date();
      return await this.skillRepo.save(existingSkill);
    } else {
      // Create new skill
      return await this.create(name);
    }
  }

  async search(query: string, limit = 10): Promise<Skill[]> {
    return await this.skillRepo.find({
      where: { name: Like(`%${query}%`) },
      take: limit,
    });
  }

  async getTopSkills(sinceDays: number, limit = 10): Promise<TopSkill[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - sinceDays);

    // Use TypeORM query builder for complex queries
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

  async addSkillsToJob(jobId: string, skillNames: string[]): Promise<void> {
    if (skillNames.length === 0) return;

    // Upsert skills and get their IDs
    const skillIds: string[] = [];
    for (const skillName of skillNames) {
      const skill = await this.upsert(skillName);
      skillIds.push(skill.id);
    }

    // Add job-skill relationships
    for (const skillId of skillIds) {
      const existingJobSkill = await this.jobSkillRepo.findOne({
        where: { job_id: jobId, skill_id: skillId },
      });

      if (!existingJobSkill) {
        const jobSkill = this.jobSkillRepo.create({
          job_id: jobId,
          skill_id: skillId,
          created_at: new Date(),
        });
        await this.jobSkillRepo.save(jobSkill);
      }
    }
  }
}
