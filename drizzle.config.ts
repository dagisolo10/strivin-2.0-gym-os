import "dotenv/config";

import { defineConfig } from "drizzle-kit";

// const databaseUrl = process.env.DATABASE_URL;
// if (!databaseUrl) throw new Error("DATABASE_URL is required for Drizzle configuration.");

export default defineConfig({
    schema: "./src/db/sqlite.ts",
    // schema: "./src/db/postgresql.ts",

    out: "./src/drizzle",

    dialect: "sqlite",
    // dialect: "postgresql",

    driver: "expo",

    dbCredentials: {
        url: "gym.db",
        // url: databaseUrl,
    },
});
