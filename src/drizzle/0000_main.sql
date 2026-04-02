CREATE TABLE "exercise_logs" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"session_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"reps" real,
	"weight" real,
	"duration" integer,
	"distance" real,
	"completed" integer DEFAULT false,
	"date" text DEFAULT '2026-04-02T10:41:59.870Z' NOT NULL,
	FOREIGN KEY ("session_id") REFERENCES "workout_sessions"("id") ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"workout_day_id" integer NOT NULL,
	"name" text NOT NULL,
	"sets" integer,
	"reps" integer,
	"weight" real,
	"distance" real,
	"duration" integer,
	"unit" text DEFAULT 'kg',
	"type" text NOT NULL,
	"variant" text NOT NULL,
	FOREIGN KEY ("workout_day_id") REFERENCES "workout_days"("id") ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"name" text NOT NULL,
	"profile" text,
	"created_at" text DEFAULT '2026-04-02T10:41:59.868Z'
);
--> statement-breakpoint
CREATE TABLE "workout_days" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"plan_id" integer NOT NULL,
	"day_name" text NOT NULL,
	"target_duration" integer DEFAULT 60,
	FOREIGN KEY ("plan_id") REFERENCES "workout_plans"("id") ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE "workout_plans" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"days_per_week" integer NOT NULL,
	"split" text NOT NULL,
	"goal" text,
	"created_at" text DEFAULT '2026-04-02T10:41:59.869Z'
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"date" text DEFAULT '2026-04-02T10:41:59.870Z' NOT NULL,
	"perfect_day" integer DEFAULT false
);
