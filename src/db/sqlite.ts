import { randomUUID } from "expo-crypto";
import { relations, sql } from "drizzle-orm";
import { index, sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const syncMetadata = sqliteTable("sync_metadata", {
    tableName: text("table_name").primaryKey(),
    lastSyncedAt: integer("last_synced_at").notNull(),
});

export const users = sqliteTable("users", {
    localId: text("local_id")
        .primaryKey()
        .$defaultFn(() => randomUUID()),
    serverId: text("server_id"),
    supabaseId: text("supabase_id").unique().notNull(),

    name: text("name").notNull(),
    profile: text("profile"),

    currentStreak: integer("current_streak").default(0),
    longestStreak: integer("longest_streak").default(0),
    lastStreakAwardedAt: text("last_streak_awarded_at"),

    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    syncStatus: text("sync_status").default("pending").$type<SyncStatus>().notNull(),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const workoutPlans = sqliteTable(
    "workout_plans",
    {
        localId: text("local_id")
            .primaryKey()
            .$defaultFn(() => randomUUID()),
        serverId: text("server_id"),

        userId: text("user_id")
            .references(() => users.localId)
            .notNull(),
        workoutDaysPerWeek: integer("days_per_week").notNull(),
        split: text("split").$type<WorkoutSplit>().notNull(),
        goal: text("goal").$type<Goal>(),

        fitnessLevel: text("fitness_level").$type<FitnessLevel>(),
        createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),

        syncStatus: text("sync_status").default("pending").$type<SyncStatus>().notNull(),
        isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
        updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => ({
        userIdIdx: index("workout_plans_user_id_idx").on(table.userId),
    }),
);

export const workoutDays = sqliteTable(
    "workout_days",
    {
        localId: text("local_id")
            .primaryKey()
            .$defaultFn(() => randomUUID()),
        serverId: text("server_id"),

        userId: text("user_id")
            .references(() => users.localId)

            .notNull(),
        planId: text("plan_id")
            .references(() => workoutPlans.localId)

            .notNull(),
        dayName: text("day_name").$type<Weekday>().notNull(),
        createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),

        syncStatus: text("sync_status").default("pending").$type<SyncStatus>().notNull(),
        updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
        isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
    },
    (table) => ({
        userIdIdx: index("workout_days_user_id_idx").on(table.userId),
        planIdIdx: index("workout_days_plan_id_idx").on(table.planId),
    }),
);

export const exercises = sqliteTable(
    "exercises",
    {
        localId: text("local_id")
            .primaryKey()
            .$defaultFn(() => randomUUID()),
        serverId: text("server_id"),

        userId: text("user_id")
            .references(() => users.localId)
            .notNull(),
        planId: text("plan_id")
            .references(() => workoutPlans.localId)
            .notNull(),
        workoutDayId: text("workout_day_id")
            .references(() => workoutDays.localId)

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
        createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),

        syncStatus: text("sync_status").default("pending").$type<SyncStatus>().notNull(),
        isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
        updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => ({
        userIdIdx: index("exercises_user_id_idx").on(table.userId),
        planIdIdx: index("exercises_plan_id_idx").on(table.planId),
        workoutDayIdIdx: index("exercises_day_id_idx").on(table.workoutDayId),
    }),
);

export const workoutSessions = sqliteTable(
    "workout_sessions",
    {
        localId: text("local_id")
            .primaryKey()
            .$defaultFn(() => randomUUID()),
        serverId: text("server_id"),

        userId: text("user_id")
            .references(() => users.localId)
            .notNull(),
        date: text("date").notNull(),
        sessionLength: integer("session_length"),
        perfectDay: integer("perfect_day", { mode: "boolean" }).default(false),
        createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),

        syncStatus: text("sync_status").default("pending").$type<SyncStatus>().notNull(),
        isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
        updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => ({
        userIdIdx: index("workout_sessions_user_id_idx").on(table.userId),
        userDateIdx: index("workout_sessions_user_date_idx").on(table.userId, table.date),
    }),
);

export const exerciseLogs = sqliteTable(
    "exercise_logs",
    {
        localId: text("local_id")
            .primaryKey()
            .$defaultFn(() => randomUUID()),
        serverId: text("server_id"),

        userId: text("user_id")
            .references(() => users.localId)
            .notNull(),
        sessionId: text("session_id")
            .references(() => workoutSessions.localId)
            .notNull(),
        exerciseId: text("exercise_id")
            .references(() => exercises.localId)
            .notNull(),

        reps: real("reps"),
        weight: real("weight"),

        duration: integer("duration"),
        distance: real("distance"),

        completed: integer("completed", { mode: "boolean" }).default(false),
        createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),

        syncStatus: text("sync_status").default("pending").$type<SyncStatus>().notNull(),
        isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
        updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
    },
    (table) => ({
        userIdIdx: index("exercise_logs_user_id_idx").on(table.userId),
        sessionIdIdx: index("exercise_logs_session_id_idx").on(table.sessionId),
        exerciseSessionIdx: index("logs_exercise_session_idx").on(table.exerciseId, table.sessionId),
    }),
);

export const usersRelations = relations(users, ({ many }) => ({
    plans: many(workoutPlans),
    sessions: many(workoutSessions),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ many, one }) => ({
    user: one(users, { fields: [workoutPlans.userId], references: [users.localId] }),
    days: many(workoutDays),
}));

export const workoutDaysRelations = relations(workoutDays, ({ one, many }) => ({
    plan: one(workoutPlans, { fields: [workoutDays.planId], references: [workoutPlans.localId] }),
    exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
    day: one(workoutDays, { fields: [exercises.workoutDayId], references: [workoutDays.localId] }),
    logs: many(exerciseLogs),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ many, one }) => ({
    user: one(users, { fields: [workoutSessions.userId], references: [users.localId] }),
    logs: many(exerciseLogs),
}));

export const exerciseLogsRelations = relations(exerciseLogs, ({ one }) => ({
    session: one(workoutSessions, { fields: [exerciseLogs.sessionId], references: [workoutSessions.localId] }),
    exercise: one(exercises, { fields: [exerciseLogs.exerciseId], references: [exercises.localId] }),
}));
