import * as schema from "@/db/sqlite";
import { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof schema.users>;
export type WorkoutPlan = InferSelectModel<typeof schema.workoutPlans>;
export type WorkoutDay = InferSelectModel<typeof schema.workoutDays>;
export type ExerciseDB = InferSelectModel<typeof schema.exercises>;
export type WorkoutSession = InferSelectModel<typeof schema.workoutSessions>;
export type ExerciseLog = InferSelectModel<typeof schema.exerciseLogs>;

export interface Exercise {
    name: string;
    workoutDays: Weekday[];
    unit: Unit;

    sets?: number;
    reps?: number;
    weight?: number;

    distance?: number;
    duration?: number;

    type: ExerciseType;
    variant: ExerciseVariant;
}

export type PlanWithRelations = WorkoutPlan & {
    days: (WorkoutDay & {
        exercises: (ExerciseDB & {
            logs: ExerciseLog[];
        })[];
    })[];
};

export type SessionWithRelations = WorkoutSession & {
    logs: (ExerciseLog & {
        exercise: ExerciseDB;
    })[];
};

export type UserWithRelations = User & {
    plans: PlanWithRelations[];
    sessions: SessionWithRelations[];
};
