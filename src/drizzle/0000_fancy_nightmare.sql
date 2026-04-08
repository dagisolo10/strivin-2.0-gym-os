CREATE TABLE `exercise_logs` (
	`local_id` text PRIMARY KEY NOT NULL,
	`server_id` text,
	`user_id` text NOT NULL,
	`session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`reps` real,
	`weight` real,
	`duration` integer,
	`distance` real,
	`completed` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`sync_status` text DEFAULT 'pending' NOT NULL,
	`is_deleted` integer DEFAULT false,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`local_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `workout_sessions`(`local_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`local_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `exercise_logs_user_id_idx` ON `exercise_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `exercise_logs_session_id_idx` ON `exercise_logs` (`session_id`);--> statement-breakpoint
CREATE INDEX `logs_exercise_session_idx` ON `exercise_logs` (`exercise_id`,`session_id`);--> statement-breakpoint
CREATE TABLE `exercises` (
	`local_id` text PRIMARY KEY NOT NULL,
	`server_id` text,
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`workout_day_id` text NOT NULL,
	`name` text NOT NULL,
	`sets` integer,
	`reps` integer,
	`weight` real,
	`distance` real,
	`duration` integer,
	`unit` text DEFAULT 'kg',
	`type` text NOT NULL,
	`variant` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`sync_status` text DEFAULT 'pending' NOT NULL,
	`is_deleted` integer DEFAULT false,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`local_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_id`) REFERENCES `workout_plans`(`local_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`workout_day_id`) REFERENCES `workout_days`(`local_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `exercises_user_id_idx` ON `exercises` (`user_id`);--> statement-breakpoint
CREATE INDEX `exercises_plan_id_idx` ON `exercises` (`plan_id`);--> statement-breakpoint
CREATE INDEX `exercises_day_id_idx` ON `exercises` (`workout_day_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`local_id` text PRIMARY KEY NOT NULL,
	`server_id` text,
	`name` text NOT NULL,
	`profile` text,
	`current_streak` integer DEFAULT 0,
	`longest_streak` integer DEFAULT 0,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`sync_status` text DEFAULT 'pending' NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `workout_days` (
	`local_id` text PRIMARY KEY NOT NULL,
	`server_id` text,
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`day_name` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`sync_status` text DEFAULT 'pending' NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	`is_deleted` integer DEFAULT false,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`local_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_id`) REFERENCES `workout_plans`(`local_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `workout_days_user_id_idx` ON `workout_days` (`user_id`);--> statement-breakpoint
CREATE INDEX `workout_days_plan_id_idx` ON `workout_days` (`plan_id`);--> statement-breakpoint
CREATE TABLE `workout_plans` (
	`local_id` text PRIMARY KEY NOT NULL,
	`server_id` text,
	`user_id` text NOT NULL,
	`days_per_week` integer NOT NULL,
	`split` text NOT NULL,
	`goal` text,
	`fitness_level` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`sync_status` text DEFAULT 'pending' NOT NULL,
	`is_deleted` integer DEFAULT false,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`local_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `workout_plans_user_id_idx` ON `workout_plans` (`user_id`);--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`local_id` text PRIMARY KEY NOT NULL,
	`server_id` text,
	`user_id` text NOT NULL,
	`date` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`session_length` integer,
	`perfect_day` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`sync_status` text DEFAULT 'pending' NOT NULL,
	`is_deleted` integer DEFAULT false,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`local_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `workout_sessions_user_id_idx` ON `workout_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `workout_sessions_user_date_idx` ON `workout_sessions` (`user_id`,`date`);