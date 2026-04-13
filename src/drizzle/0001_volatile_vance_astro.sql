PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workout_sessions` (
	`local_id` text PRIMARY KEY NOT NULL,
	`server_id` text,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`session_length` integer,
	`perfect_day` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`sync_status` text DEFAULT 'pending' NOT NULL,
	`is_deleted` integer DEFAULT false,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`local_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_workout_sessions`("local_id", "server_id", "user_id", "date", "session_length", "perfect_day", "created_at", "sync_status", "is_deleted", "updated_at") SELECT "local_id", "server_id", "user_id", "date", "session_length", "perfect_day", "created_at", "sync_status", "is_deleted", "updated_at" FROM `workout_sessions`;--> statement-breakpoint
DROP TABLE `workout_sessions`;--> statement-breakpoint
ALTER TABLE `__new_workout_sessions` RENAME TO `workout_sessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `workout_sessions_user_id_idx` ON `workout_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `workout_sessions_user_date_idx` ON `workout_sessions` (`user_id`,`date`);