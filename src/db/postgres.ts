import { relations } from "drizzle-orm";
import { ExerciseType, ExerciseVariant, Goal, Unit, WorkoutSplit } from "@/types/interface";
import { boolean, pgTable, real, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

// --- Tables ---

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    profile: text("profile"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const workoutPlans = pgTable("workout_plans", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    workoutDaysPerWeek: integer("days_per_week").notNull(),
    split: text("split").$type<WorkoutSplit>().notNull(),
    goal: text("goal").$type<Goal>(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const workoutDays = pgTable("workout_days", {
    id: serial("id").primaryKey(),
    planId: integer("plan_id")
        .references(() => workoutPlans.id, { onDelete: "cascade" })
        .notNull(),
    dayName: text("day_name").notNull(),
    targetDuration: integer("target_duration").default(60),
});

export const exercises = pgTable("exercises", {
    id: serial("id").primaryKey(),
    workoutDay: integer("workout_day_id")
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

export const workoutSessions = pgTable("workout_sessions", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    date: timestamp("date").defaultNow().notNull(),
    perfectDay: boolean("perfect_day").default(false).notNull(),
});

export const exerciseLogs = pgTable("exercise_logs", {
    id: serial("id").primaryKey(),
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

    completed: boolean("completed").default(false).notNull(),
    date: timestamp("date").defaultNow().notNull(),
});

// --- Relations ---

export const workoutPlansRelations = relations(workoutPlans, ({ many }) => ({
    days: many(workoutDays),
}));

export const workoutDaysRelations = relations(workoutDays, ({ one, many }) => ({
    plan: one(workoutPlans, { fields: [workoutDays.planId], references: [workoutPlans.id] }),
    exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
    day: one(workoutDays, { fields: [exercises.workoutDay], references: [workoutDays.id] }),
    logs: many(exerciseLogs),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
    logs: many(exerciseLogs),
}));

export const exerciseLogsRelations = relations(exerciseLogs, ({ one }) => ({
    session: one(workoutSessions, { fields: [exerciseLogs.sessionId], references: [workoutSessions.id] }),
    exercise: one(exercises, { fields: [exerciseLogs.exerciseId], references: [exercises.id] }),
}));

// --- Export Types ---

export type User = typeof users.$inferSelect;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type WorkoutDay = typeof workoutDays.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type ExerciseLog = typeof exerciseLogs.$inferSelect;
