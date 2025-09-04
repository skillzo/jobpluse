import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export enum IngestionStatus {
  SUCCESS = "success",
  PARTIAL = "partial",
  ERROR = "error",
}

@Entity("ingestions")
export class Ingestion {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  source: string;

  @Column({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  ran_at: Date;

  @Column({ type: "decimal", precision: 10, scale: 0, default: 0 })
  count_inserted: number;

  @Column({ type: "decimal", precision: 10, scale: 0, default: 0 })
  count_updated: number;

  @Column({ type: "enum", enum: IngestionStatus })
  status: IngestionStatus;

  @Column({ type: "text", nullable: true })
  error_text: string;

  @CreateDateColumn()
  created_at: Date;
}
