import { Request, Response } from "express";
import { TrendService } from "../../domain/services/TrendService";
import { CustomError } from "../../infrastructure/http/errorHandler";

export class AnalyticsController {
  private trendService: TrendService;

  constructor() {
    this.trendService = new TrendService();
  }

  async getTopSkills(req: Request, res: Response): Promise<void> {
    const { since = "7d" } = req.query;
    const sinceDays = this.parseSinceParam(since as string);

    const skills = await this.trendService.getTopSkills(sinceDays);
    res.json(skills);
  }

  async getSkillTrend(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    const { since = "30d" } = req.query;

    if (!name) {
      throw new CustomError("Skill name is required", 400);
    }

    const sinceDays = this.parseSinceParam(since as string);
    const trend = await this.trendService.getSkillTrend(name, sinceDays);
    res.json(trend);
  }

  async getTopCompanies(req: Request, res: Response): Promise<void> {
    const { since = "7d" } = req.query;
    const sinceDays = this.parseSinceParam(since as string);

    const companies = await this.trendService.getTopCompanies(sinceDays);
    res.json(companies);
  }

  async getTopLocations(req: Request, res: Response): Promise<void> {
    const { since = "7d" } = req.query;
    const sinceDays = this.parseSinceParam(since as string);

    const locations = await this.trendService.getTopLocations(sinceDays);
    res.json(locations);
  }

  private parseSinceParam(since: string): number {
    const match = since.match(/^(\d+)([dwmy])$/);
    if (!match) {
      return 7; // Default to 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "d":
        return value;
      case "w":
        return value * 7;
      case "m":
        return value * 30;
      case "y":
        return value * 365;
      default:
        return 7;
    }
  }
}
