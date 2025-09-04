import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "../../config/env";
import { logger } from "../logging/logger";

// Import all entities
import { Company } from "../../domain/entities/Company";
import { Job } from "../../domain/entities/Job";
import { Location } from "../../domain/entities/Location";
import { Skill } from "../../domain/entities/Skill";
import { JobSkill } from "../../domain/entities/JobSkill";
import { Ingestion } from "../../domain/entities/Ingestion";

// Parse DATABASE_URL to extract connection details
function parseDatabaseUrl(databaseUrl: string) {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
  };
}

const dbConfig = parseDatabaseUrl(config.DATABASE_URL);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  synchronize: false, // Set to true only in development
  logging: config.IS_DEV,
  entities: [Company, Job, Location, Skill, JobSkill, Ingestion],
  migrations: ["src/infrastructure/db/migrations/*.ts"],
  subscribers: [],
  ssl: false,
});

// Initialize database connection
export async function initializeDatabase(): Promise<void> {
  try {
    logger.info("Initializing database connection...");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info("Database connection initialized successfully");
    }

    // Create database views and indexes
    await createDatabaseViews();
    logger.info("Database views and indexes created successfully");
  } catch (error) {
    logger.error("Failed to initialize database:", error);
    throw error;
  }
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Database connection closed");
    }
  } catch (error) {
    logger.error("Error closing database connection:", error);
  }
}

// Create database views and indexes
async function createDatabaseViews(): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    // Create search vector column
    await queryRunner.query(`
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS search_vector tsvector 
      GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description_md, '')), 'B')
      ) STORED;
    `);

    // Create search index
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS jobs_search_vector_idx ON jobs USING GIN (search_vector);
    `);

    // Create trigram extension and indexes
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS jobs_title_trgm_idx ON jobs USING GIN (title gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS jobs_description_trgm_idx ON jobs USING GIN (description_md gin_trgm_ops);
    `);

    // Create materialized view for skill counts daily
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_skill_counts_daily AS
      SELECT 
        DATE(j.posted_at) as day,
        s.id as skill_id,
        s.name as skill_name,
        COUNT(DISTINCT j.id) as job_count
      FROM jobs j
      JOIN job_skills js ON j.id = js.job_id
      JOIN skills s ON js.skill_id = s.id
      WHERE j.is_active = true
      GROUP BY DATE(j.posted_at), s.id, s.name
      ORDER BY day DESC, job_count DESC;
    `);

    // Create view for skill co-occurrence
    await queryRunner.query(`
      CREATE OR REPLACE VIEW v_skill_cooccurrence AS
      SELECT 
        s1.name as skill_a,
        s2.name as skill_b,
        COUNT(DISTINCT j.id) as co_count
      FROM jobs j
      JOIN job_skills js1 ON j.id = js1.job_id
      JOIN skills s1 ON js1.skill_id = s1.id
      JOIN job_skills js2 ON j.id = js2.job_id
      JOIN skills s2 ON js2.skill_id = s2.id
      WHERE s1.id < s2.id AND j.is_active = true
      GROUP BY s1.name, s2.name
      ORDER BY co_count DESC;
    `);
  } finally {
    await queryRunner.release();
  }
}
