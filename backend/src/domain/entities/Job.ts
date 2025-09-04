import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  Index,
} from "typeorm";
import { Company } from "./Company";
import { Location } from "./Location";
import { Skill } from "./Skill";

export enum PayPeriod {
  YEAR = "year",
  MONTH = "month",
  WEEK = "week",
  DAY = "day",
  HOUR = "hour",
}

@Entity("jobs")
@Index(["source"])
@Index(["posted_at"])
@Index(["is_active"])
@Index(["last_seen_at"])
@Index(["search_vector"])
@Index(["company_id"])
@Index(["location_id"])
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text", unique: true })
  external_id: string;

  @Column({ type: "text", default: "remoteok" })
  source: string;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "uuid" })
  company_id: string;

  @Column({ type: "uuid", nullable: true })
  location_id: string;

  @Column({ type: "text" })
  url: string;

  @Column({ type: "text", nullable: true })
  description_md: string;

  @Column({ type: "timestamp with time zone" })
  posted_at: Date;

  @Column({ type: "boolean", default: false })
  remote: boolean;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  min_salary: number;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  max_salary: number;

  @Column({ type: "char", length: 3, nullable: true })
  currency: string;

  @Column({ type: "enum", enum: PayPeriod, nullable: true })
  pay_period: PayPeriod;

  @Column({ type: "text" })
  content_hash: string;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  last_seen_at: Date;

  @Column({
    type: "tsvector",
    generatedType: "STORED",
    asExpression:
      "setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(description_md, '')), 'B')",
  })
  search_vector: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Company, (company) => company.jobs)
  @JoinColumn({ name: "company_id" })
  company: Company;

  @ManyToOne(() => Location, (location) => location.jobs)
  @JoinColumn({ name: "location_id" })
  location: Location;

  @ManyToMany(() => Skill, (skill) => skill.jobs)
  skills: Skill[];
}
