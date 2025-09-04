import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1700000000000 implements MigrationInterface {
  name = "InitialSchema1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(
      `CREATE TYPE "public"."pay_period_enum" AS ENUM('year', 'month', 'week', 'day', 'hour')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ingestion_status_enum" AS ENUM('success', 'partial', 'error')`
    );

    // Create companies table
    await queryRunner.query(`
            CREATE TABLE "companies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" text NOT NULL,
                "website" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_companies_name" UNIQUE ("name"),
                CONSTRAINT "PK_companies" PRIMARY KEY ("id")
            )
        `);

    // Create locations table
    await queryRunner.query(`
            CREATE TABLE "locations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "city" text,
                "region" text,
                "country" text,
                "raw" text NOT NULL,
                "latitude" numeric(10,7),
                "longitude" numeric(10,7),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_locations" PRIMARY KEY ("id")
            )
        `);

    // Create skills table
    await queryRunner.query(`
            CREATE TABLE "skills" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" text NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_skills_name" UNIQUE ("name"),
                CONSTRAINT "PK_skills" PRIMARY KEY ("id")
            )
        `);

    // Create jobs table
    await queryRunner.query(`
            CREATE TABLE "jobs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "external_id" text NOT NULL,
                "source" text NOT NULL DEFAULT 'remoteok',
                "title" text NOT NULL,
                "company_id" uuid NOT NULL,
                "location_id" uuid,
                "url" text NOT NULL,
                "description_md" text,
                "posted_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "remote" boolean NOT NULL DEFAULT false,
                "min_salary" numeric(12,2),
                "max_salary" numeric(12,2),
                "currency" character(3),
                "pay_period" "public"."pay_period_enum",
                "content_hash" text NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "last_seen_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_jobs_external_id" UNIQUE ("external_id"),
                CONSTRAINT "PK_jobs" PRIMARY KEY ("id")
            )
        `);

    // Create job_skills junction table
    await queryRunner.query(`
            CREATE TABLE "job_skills" (
                "job_id" uuid NOT NULL,
                "skill_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_job_skills" PRIMARY KEY ("job_id", "skill_id")
            )
        `);

    // Create ingestions table
    await queryRunner.query(`
            CREATE TABLE "ingestions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "source" text NOT NULL,
                "ran_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "count_inserted" numeric(10,0) NOT NULL DEFAULT '0',
                "count_updated" numeric(10,0) NOT NULL DEFAULT '0',
                "status" "public"."ingestion_status_enum" NOT NULL,
                "error_text" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ingestions" PRIMARY KEY ("id")
            )
        `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_source" ON "jobs" ("source")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_posted_at" ON "jobs" ("posted_at")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_is_active" ON "jobs" ("is_active")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_last_seen_at" ON "jobs" ("last_seen_at")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_company_id" ON "jobs" ("company_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_location_id" ON "jobs" ("location_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_job_skills_job_id" ON "job_skills" ("job_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_job_skills_skill_id" ON "job_skills" ("skill_id")`
    );

    // Create foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_jobs_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_jobs_location_id" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "job_skills" ADD CONSTRAINT "FK_job_skills_job_id" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "job_skills" ADD CONSTRAINT "FK_job_skills_skill_id" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    // Enable uuid-ossp extension for uuid generation
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "job_skills" DROP CONSTRAINT "FK_job_skills_skill_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "job_skills" DROP CONSTRAINT "FK_job_skills_job_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP CONSTRAINT "FK_jobs_location_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP CONSTRAINT "FK_jobs_company_id"`
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_job_skills_skill_id"`);
    await queryRunner.query(`DROP INDEX "IDX_job_skills_job_id"`);
    await queryRunner.query(`DROP INDEX "IDX_jobs_location_id"`);
    await queryRunner.query(`DROP INDEX "IDX_jobs_company_id"`);
    await queryRunner.query(`DROP INDEX "IDX_jobs_last_seen_at"`);
    await queryRunner.query(`DROP INDEX "IDX_jobs_is_active"`);
    await queryRunner.query(`DROP INDEX "IDX_jobs_posted_at"`);
    await queryRunner.query(`DROP INDEX "IDX_jobs_source"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "ingestions"`);
    await queryRunner.query(`DROP TABLE "job_skills"`);
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(`DROP TABLE "skills"`);
    await queryRunner.query(`DROP TABLE "locations"`);
    await queryRunner.query(`DROP TABLE "companies"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."ingestion_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."pay_period_enum"`);
  }
}
