import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Job } from "./Job";
import { Skill } from "./Skill";

@Entity("job_skills")
export class JobSkill {
  @PrimaryColumn({ type: "uuid" })
  job_id: string;

  @PrimaryColumn({ type: "uuid" })
  skill_id: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Job, (job) => job.skills)
  @JoinColumn({ name: "job_id" })
  job: Job;

  @ManyToOne(() => Skill, (skill) => skill.jobs)
  @JoinColumn({ name: "skill_id" })
  skill: Skill;
}
