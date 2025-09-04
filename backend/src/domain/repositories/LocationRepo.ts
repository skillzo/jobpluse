import { Repository, Like } from "typeorm";
import { AppDataSource } from "../../infrastructure/db";
import { Location } from "../entities/Location";

export class LocationRepository {
  private locationRepo: Repository<Location>;

  constructor() {
    this.locationRepo = AppDataSource.getRepository(Location);
  }

  async findById(id: string): Promise<Location | null> {
    return await this.locationRepo.findOne({
      where: { id },
    });
  }

  async findByRaw(raw: string): Promise<Location | null> {
    return await this.locationRepo.findOne({
      where: { raw },
    });
  }

  async create(locationData: {
    city?: string;
    region?: string;
    country?: string;
    raw: string;
    latitude?: number;
    longitude?: number;
  }): Promise<Location> {
    const location = this.locationRepo.create({
      ...locationData,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await this.locationRepo.save(location);
  }

  async upsert(locationData: {
    city?: string;
    region?: string;
    country?: string;
    raw: string;
    latitude?: number;
    longitude?: number;
  }): Promise<Location> {
    const existingLocation = await this.findByRaw(locationData.raw);

    if (existingLocation) {
      // Update existing location
      Object.assign(existingLocation, {
        ...locationData,
        updated_at: new Date(),
      });
      return await this.locationRepo.save(existingLocation);
    } else {
      // Create new location
      return await this.create(locationData);
    }
  }

  async search(query: string, limit = 10): Promise<Location[]> {
    return await this.locationRepo.find({
      where: { raw: Like(`%${query}%`) },
      take: limit,
    });
  }
}
