import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";
import path = require("path");

const dataSourceOptions: DataSourceOptions & SeederOptions = {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port:
        typeof process.env.DB_PORT === "number"
            ? parseInt(process.env.DB_PORT, 10)
            : 5432,
    username: process.env.DB_USERNAME || "default",
    password: process.env.DB_PASSWORD || "default",
    database: process.env.DB_DATABASE || "default",
    synchronize: true,
    logging: true,
    migrationsRun: true,
    entities: [
        path.join(__dirname, "..", "entity", "**", "*.{ts,js}"),
        path.join(__dirname, "..", "entity", "*.{ts,js}")
    ],
    migrations: [
        path.join(__dirname, "..", "database", "migration", "*.{ts,js}")
    ],
    subscribers: [
        path.join(__dirname, "..", "database", "subscriber", "*.{ts,js}")
    ]
};

export const AppDataSource = new DataSource(dataSourceOptions);
