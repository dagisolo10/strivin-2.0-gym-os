import { boolean, pgTable, real, text, integer, timestamp } from "drizzle-orm/pg-core";

export const syncMetadata = pgTable("sync_metadata", {
    tableName: text("table_name").primaryKey(),
    lastSyncedAt: integer("last_synced_at").notNull(),
});

export const users = pgTable("users", {
    localId: text("local_id").primaryKey(),
    serverId: text("server_id"),

    supabaseId: text("supabase_id").unique().notNull(),

    name: text("name").notNull(),
    profile: text("profile"),

    currentStreak: integer("current_streak").default(0),
    longestStreak: integer("longest_streak").default(0),
    lastStreakAwardedAt: text("last_streak_awarded_at"),

    createdAt: timestamp("created_at").defaultNow(),

    syncStatus: text("sync_status").$type<SyncStatus>().default("synced").notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const workoutPlans = pgTable("workout_plans", {
    localId: text("local_id").primaryKey(),
    serverId: text("server_id"),

    userId: text("user_id")
        .references(() => users.localId, { onDelete: "cascade" })
        .notNull(),

    workoutDaysPerWeek: integer("days_per_week").notNull(),
    split: text("split").$type<WorkoutSplit>().notNull(),
    goal: text("goal").$type<Goal>(),
    fitnessLevel: text("fitness_level").$type<FitnessLevel>(),

    createdAt: timestamp("created_at").defaultNow(),

    syncStatus: text("sync_status").$type<SyncStatus>().default("synced").notNull(),
    isDeleted: boolean("is_deleted").default(false),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const workoutDays = pgTable("workout_days", {
    localId: text("local_id").primaryKey(),
    serverId: text("server_id"),

    userId: text("user_id")
        .references(() => users.localId, { onDelete: "cascade" })
        .notNull(),

    planId: text("plan_id")
        .references(() => workoutPlans.localId, { onDelete: "cascade" })
        .notNull(),

    dayName: text("day_name").notNull(),

    createdAt: timestamp("created_at").defaultNow(),

    syncStatus: text("sync_status").$type<SyncStatus>().default("synced").notNull(),
    isDeleted: boolean("is_deleted").default(false),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const exercises = pgTable("exercises", {
    localId: text("local_id").primaryKey(),
    serverId: text("server_id"),

    userId: text("user_id")
        .references(() => users.localId, { onDelete: "cascade" })
        .notNull(),

    planId: text("plan_id")
        .references(() => workoutPlans.localId, { onDelete: "cascade" })
        .notNull(),

    workoutDayId: text("workout_day_id")
        .references(() => workoutDays.localId, { onDelete: "cascade" })
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

    createdAt: timestamp("created_at").defaultNow(),

    syncStatus: text("sync_status").$type<SyncStatus>().default("synced").notNull(),
    isDeleted: boolean("is_deleted").default(false),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const workoutSessions = pgTable("workout_sessions", {
    localId: text("local_id").primaryKey(),
    serverId: text("server_id"),

    userId: text("user_id")
        .references(() => users.localId, { onDelete: "cascade" })
        .notNull(),

    date: timestamp("date").defaultNow().notNull(),
    sessionLength: integer("session_length"),
    perfectDay: boolean("perfect_day").default(false),

    createdAt: timestamp("created_at").defaultNow(),

    syncStatus: text("sync_status").$type<SyncStatus>().default("synced").notNull(),
    isDeleted: boolean("is_deleted").default(false),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const exerciseLogs = pgTable("exercise_logs", {
    localId: text("local_id").primaryKey(),
    serverId: text("server_id"),

    userId: text("user_id")
        .references(() => users.localId, { onDelete: "cascade" })
        .notNull(),

    sessionId: text("session_id")
        .references(() => workoutSessions.localId, { onDelete: "cascade" })
        .notNull(),

    exerciseId: text("exercise_id")
        .references(() => exercises.localId, { onDelete: "cascade" })
        .notNull(),

    reps: real("reps"),
    weight: real("weight"),

    duration: integer("duration"),
    distance: real("distance"),

    completed: boolean("completed").default(false),

    createdAt: timestamp("created_at").defaultNow(),

    syncStatus: text("sync_status").$type<SyncStatus>().default("synced").notNull(),
    isDeleted: boolean("is_deleted").default(false),
    updatedAt: timestamp("updated_at").defaultNow(),
});
