import { DataSource } from "typeorm";
import { config } from "./src/config/env";

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

export default new DataSource({
  type: "postgres",
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  synchronize: false,
  logging: config.IS_DEV,
  entities: ["src/domain/entities/*.ts"],
  migrations: ["src/infrastructure/db/migrations/*.ts"],
  subscribers: [],
  ssl: false,
});
