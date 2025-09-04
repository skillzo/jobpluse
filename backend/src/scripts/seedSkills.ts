import { initializeDatabase, closeDatabase } from "../infrastructure/db";
import { SkillRepository } from "../domain/repositories/SkillRepo";
import { logger } from "../infrastructure/logging/logger";
import * as fs from "fs";
import * as path from "path";

async function seedSkills(): Promise<void> {
  try {
    logger.info("Starting skills seeding...");

    // Initialize database
    await initializeDatabase();

    // Read skills from JSON file
    const skillsPath = path.join(__dirname, "../../data/skills.seed.json");
    const skillsData = fs.readFileSync(skillsPath, "utf8");
    const skills = JSON.parse(skillsData) as string[];

    logger.info(`Found ${skills.length} skills to seed`);

    // Initialize repository
    const skillRepo = new SkillRepository();

    // Seed skills
    let inserted = 0;
    let skipped = 0;

    for (const skillName of skills) {
      try {
        // Check if skill already exists
        const existingSkill = await skillRepo.findByName(skillName);
        if (existingSkill) {
          skipped++;
          continue;
        }

        // Create new skill
        await skillRepo.create(skillName);
        inserted++;
      } catch (error) {
        logger.error(`Failed to seed skill "${skillName}":`, error);
      }
    }

    logger.info(
      `Skills seeding completed: ${inserted} inserted, ${skipped} skipped`
    );
  } catch (error) {
    logger.error("Skills seeding failed:", error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Run the script
seedSkills();
