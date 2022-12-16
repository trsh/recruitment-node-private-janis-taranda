import config from "config/config";
import { DataSource, DataSourceOptions } from "typeorm";

let tableAndMigrations = {
  migrations: ["src/orm/migrations/**/*.ts"],
  migrationsTableName: "seed_migrations"
}

if (process.env["npm_config_seed"]) {
  tableAndMigrations = {
    migrations: ["src/orm/seeds/**/*.ts"],
    migrationsTableName: "seed_migrations"
  }
}

export const options: DataSourceOptions = {
  type: "postgres",
  entities: ["src/**/**/entities/**/*.ts"],
  synchronize: false,
  //migrations: ["src/**/**/migrations/**/*.ts"],
  host: config.DB_HOST,
  port: config.DB_PORT,
  //migrationsTransactionMode: "each",
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  ...tableAndMigrations
};

export default new DataSource(options);
