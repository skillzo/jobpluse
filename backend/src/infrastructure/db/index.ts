export {
  AppDataSource,
  initializeDatabase,
  closeDatabase,
} from "./data-source";

// Re-export entities for convenience
export { Company } from "../../domain/entities/Company";
export { Job, PayPeriod } from "../../domain/entities/Job";
export { Location } from "../../domain/entities/Location";
export { Skill } from "../../domain/entities/Skill";
export { JobSkill } from "../../domain/entities/JobSkill";
export { Ingestion, IngestionStatus } from "../../domain/entities/Ingestion";
