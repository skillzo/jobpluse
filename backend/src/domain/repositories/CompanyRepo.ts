import { Repository, Like } from "typeorm";
import { AppDataSource } from "../../infrastructure/db";
import { Company } from "../entities/Company";

export class CompanyRepository {
  private companyRepo: Repository<Company>;

  constructor() {
    this.companyRepo = AppDataSource.getRepository(Company);
  }

  async findById(id: string): Promise<Company | null> {
    return await this.companyRepo.findOne({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Company | null> {
    return await this.companyRepo.findOne({
      where: { name },
    });
  }

  async create(name: string, website?: string): Promise<Company> {
    const company = this.companyRepo.create({
      name,
      website,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await this.companyRepo.save(company);
  }

  async upsert(name: string, website?: string): Promise<Company> {
    const existingCompany = await this.findByName(name);

    if (existingCompany) {
      // Update existing company
      existingCompany.website = website;
      existingCompany.updated_at = new Date();
      return await this.companyRepo.save(existingCompany);
    } else {
      // Create new company
      return await this.create(name, website);
    }
  }

  async search(query: string, limit = 10): Promise<Company[]> {
    return await this.companyRepo.find({
      where: { name: Like(`%${query}%`) },
      take: limit,
    });
  }
}
