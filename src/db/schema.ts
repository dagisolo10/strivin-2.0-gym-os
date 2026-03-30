import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),

    name: text("name").notNull(),
    email: text("email").unique(),

    age: integer("age"),
    score: real("score").default(0.0),

    isActive: integer("is_active", { mode: "boolean" }).default(true),

    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
