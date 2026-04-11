import * as schema from "@/db/sqlite";

export type User = typeof schema.users.$inferSelect;
export type WorkoutSession = typeof schema.workoutSessions.$inferSelect;
export type WorkoutPlan = typeof schema.workoutPlans.$inferSelect;
export type WorkoutDay = typeof schema.workoutDays.$inferSelect;
export type Exercise = typeof schema.exercises.$inferSelect;
export type ExerciseLog = typeof schema.exerciseLogs.$inferSelect;

export interface ExerciseWithLogs extends Exercise {
    logs: ExerciseLog[];
}

export interface ExerciseWithUsesWeight extends Exercise {
    usesWeight?: boolean;
}

export interface GroupedExercise {
    localId: string;
    exerciseIds: string[];
    workoutDays: Weekday[];
    exercise: ExerciseWithUsesWeight;
}

export interface WorkoutDayWithExercises extends WorkoutDay {
    exercises: ExerciseWithLogs[];
}

export interface WorkoutPlanWithDays extends WorkoutPlan {
    days: WorkoutDayWithExercises[];
}

export interface ExerciseLogWithExercise extends ExerciseLog {
    exercise: Exercise;
}

export interface WorkoutSessionWithExerciseLogs extends WorkoutSession {
    logs: ExerciseLog[];
}

export interface WorkoutSessionWithLogs extends WorkoutSession {
    logs: ExerciseLogWithExercise[];
}

export interface UserWithRelations extends User {
    plans: WorkoutPlanWithDays[];
    sessions: WorkoutSessionWithLogs[];
}

export interface UserWithPlanOnly extends User {
    plans: WorkoutPlan[];
    sessions: WorkoutSession[];
}

export interface ProgressionConfig {
    minimumSessions?: number;
    successRate?: number;
    maxHistorySessions?: number;
    repsIncrement?: number;
    weightIncrement?: number;
    setsIncrement?: number;
    distanceIncrement?: number;
    durationIncrement?: number;
}

export interface ProgressionSuggestion {
    suggestedReps?: number;
    suggestedWeight?: number;
    suggestedSets?: number;
    suggestedDistance?: number;
    suggestedDuration?: number;
    confidence: ProgressionConfidence;
    reason: string;
}

export interface SessionProgress {
    sessionId: string;
    date: string;
    completedSets: number;
    targetSets: number;
    averageReps: number | null;
    averageWeight: number | null;
    averageDistance: number | null;
    averageDuration: number | null;
    success: boolean;
    reason: string;
}
