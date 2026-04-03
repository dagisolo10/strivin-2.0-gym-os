import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    profile: text("profile"),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const workoutPlans = sqliteTable("workout_plans", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    workoutDaysPerWeek: integer("days_per_week").notNull(),
    split: text("split").$type<WorkoutSplit>().notNull(),
    goal: text("goal").$type<Goal>(),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const workoutDays = sqliteTable("workout_days", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    planId: integer("plan_id")
        .references(() => workoutPlans.id, { onDelete: "cascade" })
        .notNull(),
    dayName: text("day_name").notNull(),
});

export const exercises = sqliteTable("exercises", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    workoutDayId: integer("workout_day_id")
        .references(() => workoutDays.id, { onDelete: "cascade" })
        .notNull(),
    name: text("name").notNull(),

    sets: integer("sets"),
    reps: integer("reps"),
    weight: real("weight"),

    distance: real("distance"),
    duration: integer("duration"),

    unit: text("unit").default("kg").$type<Unit>(),
    type: text("type").$type<ExerciseType>().notNull(),
    variant: text("variant").$type<ExerciseVariant>().notNull(),
});

export const workoutSessions = sqliteTable("workout_sessions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    date: text("date")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    perfectDay: integer("perfect_day", { mode: "boolean" }).default(false),
});

export const exerciseLogs = sqliteTable("exercise_logs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: integer("session_id")
        .references(() => workoutSessions.id, { onDelete: "cascade" })
        .notNull(),
    exerciseId: integer("exercise_id")
        .references(() => exercises.id, { onDelete: "cascade" })
        .notNull(),

    reps: real("reps"),
    weight: real("weight"),

    duration: integer("duration"),
    distance: real("distance"),

    completed: integer("completed", { mode: "boolean" }).default(false),
    date: text("date")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({ plans: many(workoutPlans), sessions: many(workoutSessions) }));
export const workoutPlansRelations = relations(workoutPlans, ({ many, one }) => ({ user: one(users, { fields: [workoutPlans.userId], references: [users.id] }), days: many(workoutDays) }));
export const workoutDaysRelations = relations(workoutDays, ({ one, many }) => ({ plan: one(workoutPlans, { fields: [workoutDays.planId], references: [workoutPlans.id] }), exercises: many(exercises) }));
export const exercisesRelations = relations(exercises, ({ one, many }) => ({ day: one(workoutDays, { fields: [exercises.workoutDayId], references: [workoutDays.id] }), logs: many(exerciseLogs) }));
export const workoutSessionsRelations = relations(workoutSessions, ({ many, one }) => ({ user: one(users, { fields: [workoutSessions.userId], references: [users.id] }), logs: many(exerciseLogs) }));
export const exerciseLogsRelations = relations(exerciseLogs, ({ one }) => ({ session: one(workoutSessions, { fields: [exerciseLogs.sessionId], references: [workoutSessions.id] }), exercise: one(exercises, { fields: [exerciseLogs.exerciseId], references: [exercises.id] }) }));

// --- Export Types ---

// export type User = typeof users.$inferSelect;
// export type WorkoutPlan = typeof workoutPlans.$inferSelect;
// export type WorkoutDay = typeof workoutDays.$inferSelect;
// export type Exercise = typeof exercises.$inferSelect;
// export type WorkoutSession = typeof workoutSessions.$inferSelect;
// export type ExerciseLog = typeof exerciseLogs.$inferSelect;
