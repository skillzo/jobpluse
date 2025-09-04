import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Job } from "./Job";

@Entity("skills")
export class Skill {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text", unique: true })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToMany(() => Job, (job) => job.skills)
  @JoinTable({
    name: "job_skills",
    joinColumn: { name: "skill_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "job_id", referencedColumnName: "id" },
  })
  jobs: Job[];
}
