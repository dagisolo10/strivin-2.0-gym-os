import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/db/sqlite.ts",
    out: "./src/drizzle",
    dialect: "sqlite",
    driver: "expo",
    dbCredentials: {
        url: "gym.db",
    },
});
