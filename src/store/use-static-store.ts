import { create } from "zustand";
import { randomUUID } from "expo-crypto";
import { getDateKey } from "@/lib/helper-functions";

export interface User {
    localId: string;
    name: string;
    profile: string | null;
    createdAt: string;
}

export interface WorkoutPlan {
    localId: string;
    userId: string;
    workoutDaysPerWeek: number;
    split: WorkoutSplit;
    goal: Goal | null;
    fitnessLevel: FitnessLevel | null;
    createdAt: string;
}

export interface WorkoutDay {
    localId: string;
    userId: string;
    planId: string;
    dayName: Weekday;
}

export interface Exercise {
    localId: string;
    userId: string;
    planId: string;
    workoutDayId: string;
    name: string;
    sets: number | null;
    reps: number | null;
    weight: number | null;
    distance: number | null;
    duration: number | null;
    unit: Unit;
    type: ExerciseType;
    variant: ExerciseVariant;
}

export interface WorkoutSession {
    localId: string;
    userId: string;
    date: string;
    sessionLength: number | null;
    perfectDay: boolean;
}

export interface ExerciseLog {
    localId: string;
    userId: string;
    sessionId: string;
    exerciseId: string;
    reps: number | null;
    weight: number | null;
    duration: number | null;
    distance: number | null;
    completed: boolean;
    date: string;
}

// Relations types
export interface ExerciseWithLogs extends Exercise {
    logs: ExerciseLog[];
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

export interface WorkoutSessionWithLogs extends WorkoutSession {
    logs: ExerciseLogWithExercise[];
}

export interface UserWithRelations extends User {
    plans: WorkoutPlanWithDays[];
    sessions: WorkoutSessionWithLogs[];
}

// Initial static data with 2 plans
const initialUsers: User[] = [
    {
        localId: "user-1",
        name: "Malcom",
        profile: null,
        createdAt: new Date().toISOString(),
    },
];

const initialPlans: WorkoutPlan[] = [
    { localId: "plan-1", userId: "user-1", workoutDaysPerWeek: 6, split: "Push Pull Leg", goal: "Hypertrophy", fitnessLevel: "Advanced", createdAt: new Date().toISOString() },
    { localId: "plan-2", userId: "user-1", workoutDaysPerWeek: 4, split: "Upper Lower", goal: "Strength", fitnessLevel: "Intermediate", createdAt: new Date().toISOString() },
    { localId: "plan-3", userId: "user-1", workoutDaysPerWeek: 3, split: "Full Body", goal: "Endurance", fitnessLevel: "Beginner", createdAt: new Date().toISOString() },
    { localId: "plan-4", userId: "user-1", workoutDaysPerWeek: 6, split: "Arnold Split", goal: "Hypertrophy", fitnessLevel: "Advanced", createdAt: new Date().toISOString() },
    { localId: "plan-5", userId: "user-1", workoutDaysPerWeek: 5, split: "Hybrid Performance", goal: "Fat Loss", fitnessLevel: "Intermediate", createdAt: new Date().toISOString() },
];

const initialWorkoutDays: WorkoutDay[] = [
    // Plan 1 - Push Pull Leg
    { localId: "day-1", userId: "user-1", planId: "plan-1", dayName: "Monday" },
    { localId: "day-2", userId: "user-1", planId: "plan-1", dayName: "Tuesday" },
    { localId: "day-3", userId: "user-1", planId: "plan-1", dayName: "Wednesday" },
    { localId: "day-4", userId: "user-1", planId: "plan-1", dayName: "Thursday" },
    { localId: "day-5", userId: "user-1", planId: "plan-1", dayName: "Friday" },
    { localId: "day-6", userId: "user-1", planId: "plan-1", dayName: "Saturday" },
    { localId: "day-7", userId: "user-1", planId: "plan-1", dayName: "Sunday" },

    // Plan 2 - Upper Lower
    { localId: "day-8", userId: "user-1", planId: "plan-2", dayName: "Monday" },
    { localId: "day-9", userId: "user-1", planId: "plan-2", dayName: "Tuesday" },
    { localId: "day-10", userId: "user-1", planId: "plan-2", dayName: "Wednesday" },
    { localId: "day-11", userId: "user-1", planId: "plan-2", dayName: "Thursday" },

    // Plan 3 - Full Body
    { localId: "day-12", userId: "user-1", planId: "plan-3", dayName: "Monday" },
    { localId: "day-13", userId: "user-1", planId: "plan-3", dayName: "Wednesday" },
    { localId: "day-14", userId: "user-1", planId: "plan-3", dayName: "Friday" },

    // Plan 4 - Arnold Split
    { localId: "day-15", userId: "user-1", planId: "plan-4", dayName: "Monday" },
    { localId: "day-16", userId: "user-1", planId: "plan-4", dayName: "Tuesday" },
    { localId: "day-17", userId: "user-1", planId: "plan-4", dayName: "Wednesday" },
    { localId: "day-18", userId: "user-1", planId: "plan-4", dayName: "Thursday" },
    { localId: "day-19", userId: "user-1", planId: "plan-4", dayName: "Friday" },
    { localId: "day-20", userId: "user-1", planId: "plan-4", dayName: "Saturday" },

    // Plan 5 - Hybrid
    { localId: "day-21", userId: "user-1", planId: "plan-5", dayName: "Monday" },
    { localId: "day-22", userId: "user-1", planId: "plan-5", dayName: "Tuesday" },
    { localId: "day-23", userId: "user-1", planId: "plan-5", dayName: "Wednesday" },
    { localId: "day-24", userId: "user-1", planId: "plan-5", dayName: "Thursday" },
    { localId: "day-25", userId: "user-1", planId: "plan-5", dayName: "Friday" },
];

const initialExercises: Exercise[] = [
    // Plan 1 - Push Pull Leg exercises
    // Monday - Push
    { localId: "ex-1", userId: "user-1", planId: "plan-1", workoutDayId: "day-1", name: "Bench Press", sets: 4, reps: 8, weight: 60, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-2", userId: "user-1", planId: "plan-1", workoutDayId: "day-1", name: "Overhead Press", sets: 3, reps: 10, weight: 40, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-3", userId: "user-1", planId: "plan-1", workoutDayId: "day-1", name: "Incline Dumbbell Press", sets: 3, reps: 10, weight: 25, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-4", userId: "user-1", planId: "plan-1", workoutDayId: "day-1", name: "Tricep Push down", sets: 3, reps: 12, weight: 25, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    // Tuesday - Pull
    { localId: "ex-5", userId: "user-1", planId: "plan-1", workoutDayId: "day-2", name: "Lat Pulldown", sets: 4, reps: 10, weight: 50, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-6", userId: "user-1", planId: "plan-1", workoutDayId: "day-2", name: "Barbell Row", sets: 4, reps: 8, weight: 50, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-7", userId: "user-1", planId: "plan-1", workoutDayId: "day-2", name: "Face Pulls", sets: 3, reps: 15, weight: 15, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-8", userId: "user-1", planId: "plan-1", workoutDayId: "day-2", name: "Hammer Curls", sets: 3, reps: 12, weight: 12, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    // Wednesday - Legs
    { localId: "ex-9", userId: "user-1", planId: "plan-1", workoutDayId: "day-3", name: "Squat", sets: 4, reps: 6, weight: 90, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-10", userId: "user-1", planId: "plan-1", workoutDayId: "day-3", name: "Romanian Dead lift", sets: 3, reps: 8, weight: 70, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Lower" },
    { localId: "ex-11", userId: "user-1", planId: "plan-1", workoutDayId: "day-3", name: "Leg Press", sets: 3, reps: 12, weight: 150, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-12", userId: "user-1", planId: "plan-1", workoutDayId: "day-3", name: "Calf Raises", sets: 4, reps: 15, weight: 40, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    // Thursday - Push
    { localId: "ex-13", userId: "user-1", planId: "plan-1", workoutDayId: "day-4", name: "Shoulder Press", sets: 3, reps: 10, weight: 30, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-14", userId: "user-1", planId: "plan-1", workoutDayId: "day-4", name: "Lateral Raises", sets: 3, reps: 15, weight: 10, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-15", userId: "user-1", planId: "plan-1", workoutDayId: "day-4", name: "Bike Intervals", sets: 1, reps: null, weight: null, distance: 8, duration: 20, unit: "km", type: "Cardio", variant: "Endurance" },
    // Friday - Pull
    { localId: "ex-16", userId: "user-1", planId: "plan-1", workoutDayId: "day-5", name: "Pull Ups", sets: 3, reps: 10, weight: 0, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-17", userId: "user-1", planId: "plan-1", workoutDayId: "day-5", name: "Cable Row", sets: 3, reps: 12, weight: 40, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-18", userId: "user-1", planId: "plan-1", workoutDayId: "day-5", name: "Rear Delt Fly", sets: 3, reps: 15, weight: 8, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    // Saturday - Legs
    { localId: "ex-19", userId: "user-1", planId: "plan-1", workoutDayId: "day-6", name: "Dead lift", sets: 3, reps: 5, weight: 100, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-20", userId: "user-1", planId: "plan-1", workoutDayId: "day-6", name: "Bulgarian Split Squat", sets: 3, reps: 10, weight: 20, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-21", userId: "user-1", planId: "plan-1", workoutDayId: "day-6", name: "Leg Curls", sets: 3, reps: 12, weight: 30, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    // Sunday - Rest/Active Recovery
    { localId: "ex-22", userId: "user-1", planId: "plan-1", workoutDayId: "day-7", name: "Light Jog", sets: 1, reps: null, weight: null, distance: 5, duration: 30, unit: "km", type: "Cardio", variant: "Endurance" },
    { localId: "ex-23", userId: "user-1", planId: "plan-1", workoutDayId: "day-7", name: "Stretching", sets: 1, reps: null, weight: null, duration: 20, unit: "mins", type: "Core", variant: "Endurance", distance: null },

    // Plan 2 - Upper Lower exercises
    // Monday - Upper
    { localId: "ex-24", userId: "user-1", planId: "plan-2", workoutDayId: "day-8", name: "Bench Press", sets: 5, reps: 5, weight: 70, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-25", userId: "user-1", planId: "plan-2", workoutDayId: "day-8", name: "Weighted Pull Ups", sets: 4, reps: 6, weight: 10, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-26", userId: "user-1", planId: "plan-2", workoutDayId: "day-8", name: "Military Press", sets: 4, reps: 6, weight: 45, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-27", userId: "user-1", planId: "plan-2", workoutDayId: "day-8", name: "Pendlay Row", sets: 4, reps: 6, weight: 60, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    // Tuesday - Lower
    { localId: "ex-28", userId: "user-1", planId: "plan-2", workoutDayId: "day-9", name: "Back Squat", sets: 5, reps: 5, weight: 100, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-29", userId: "user-1", planId: "plan-2", workoutDayId: "day-9", name: "Front Squat", sets: 3, reps: 8, weight: 70, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-30", userId: "user-1", planId: "plan-2", workoutDayId: "day-9", name: "Stiff Leg Dead lift", sets: 3, reps: 8, weight: 80, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    // Thursday - Upper
    { localId: "ex-31", userId: "user-1", planId: "plan-2", workoutDayId: "day-10", name: "Incline Bench Press", sets: 4, reps: 8, weight: 55, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-32", userId: "user-1", planId: "plan-2", workoutDayId: "day-10", name: "T-Bar Row", sets: 4, reps: 8, weight: 50, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-33", userId: "user-1", planId: "plan-2", workoutDayId: "day-10", name: "Dips", sets: 3, reps: 10, weight: 0, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-34", userId: "user-1", planId: "plan-2", workoutDayId: "day-10", name: "Chin Ups", sets: 3, reps: 8, weight: 0, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    // Friday - Lower
    { localId: "ex-35", userId: "user-1", planId: "plan-2", workoutDayId: "day-11", name: "Conventional Dead lift", sets: 3, reps: 5, weight: 120, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-36", userId: "user-1", planId: "plan-2", workoutDayId: "day-11", name: "Walking Lunges", sets: 3, reps: 12, weight: 20, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-37", userId: "user-1", planId: "plan-2", workoutDayId: "day-11", name: "Leg Extensions", sets: 3, reps: 15, weight: 40, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },

    // --- Plan 3: Full Body (9 Exercises total) ---
    // Monday (Day 12)
    { localId: "ex-38", userId: "user-1", planId: "plan-3", workoutDayId: "day-12", name: "Goblet Squats", sets: 3, reps: 12, weight: 20, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-39", userId: "user-1", planId: "plan-3", workoutDayId: "day-12", name: "Push Ups", sets: 3, reps: 15, weight: 0, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-40", userId: "user-1", planId: "plan-3", workoutDayId: "day-12", name: "Plank", sets: 3, reps: null, weight: null, distance: null, duration: 60, unit: "sec", type: "Core", variant: "Endurance" },
    // Wednesday (Day 13)
    { localId: "ex-41", userId: "user-1", planId: "plan-3", workoutDayId: "day-13", name: "Lunges", sets: 3, reps: 10, weight: 15, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-42", userId: "user-1", planId: "plan-3", workoutDayId: "day-13", name: "Dumbbell Row", sets: 3, reps: 12, weight: 18, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-43", userId: "user-1", planId: "plan-3", workoutDayId: "day-13", name: "Overhead Press", sets: 3, reps: 10, weight: 12, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    // Friday (Day 14)
    { localId: "ex-44", userId: "user-1", planId: "plan-3", workoutDayId: "day-14", name: "Deadlift", sets: 3, reps: 8, weight: 40, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-45", userId: "user-1", planId: "plan-3", workoutDayId: "day-14", name: "Chest Press", sets: 3, reps: 12, weight: 14, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-46", userId: "user-1", planId: "plan-3", workoutDayId: "day-14", name: "Lat Pulldown", sets: 3, reps: 10, weight: 35, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },

    // --- Plan 4: Arnold Split (18 Exercises total) ---
    // Monday & Thursday: Chest & Back (Days 15, 18)
    { localId: "ex-47", userId: "user-1", planId: "plan-4", workoutDayId: "day-15", name: "Incline Bench", sets: 4, reps: 8, weight: 65, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-48", userId: "user-1", planId: "plan-4", workoutDayId: "day-15", name: "Pull Ups", sets: 4, reps: 10, weight: 0, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-49", userId: "user-1", planId: "plan-4", workoutDayId: "day-15", name: "Dumbbell Flys", sets: 3, reps: 12, weight: 16, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    // Tuesday & Friday: Shoulders & Arms (Days 16, 19)
    { localId: "ex-50", userId: "user-1", planId: "plan-4", workoutDayId: "day-16", name: "Military Press", sets: 4, reps: 8, weight: 45, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-51", userId: "user-1", planId: "plan-4", workoutDayId: "day-16", name: "Barbell Curls", sets: 3, reps: 12, weight: 30, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-52", userId: "user-1", planId: "plan-4", workoutDayId: "day-16", name: "Skull Crushers", sets: 3, reps: 12, weight: 25, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    // Wednesday & Saturday: Legs (Days 17, 20)
    { localId: "ex-53", userId: "user-1", planId: "plan-4", workoutDayId: "day-17", name: "Back Squat", sets: 4, reps: 6, weight: 100, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-54", userId: "user-1", planId: "plan-4", workoutDayId: "day-17", name: "Leg Curls", sets: 3, reps: 12, weight: 40, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-55", userId: "user-1", planId: "plan-4", workoutDayId: "day-17", name: "Calf Raises", sets: 4, reps: 15, weight: 60, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    // (Repeat for Days 18, 19, 20 with unique IDs)
    { localId: "ex-56", userId: "user-1", planId: "plan-4", workoutDayId: "day-18", name: "T-Bar Row", sets: 4, reps: 8, weight: 50, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-57", userId: "user-1", planId: "plan-4", workoutDayId: "day-18", name: "Chest Dips", sets: 3, reps: 10, weight: 0, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-58", userId: "user-1", planId: "plan-4", workoutDayId: "day-18", name: "Face Pulls", sets: 3, reps: 15, weight: 20, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },

    { localId: "ex-59", userId: "user-1", planId: "plan-4", workoutDayId: "day-19", name: "Lateral Raises", sets: 4, reps: 15, weight: 10, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { localId: "ex-60", userId: "user-1", planId: "plan-4", workoutDayId: "day-19", name: "Hammer Curls", sets: 3, reps: 12, weight: 14, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-61", userId: "user-1", planId: "plan-4", workoutDayId: "day-19", name: "Tricep Ext", sets: 3, reps: 12, weight: 20, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },

    { localId: "ex-62", userId: "user-1", planId: "plan-4", workoutDayId: "day-20", name: "Leg Press", sets: 3, reps: 10, weight: 160, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-63", userId: "user-1", planId: "plan-4", workoutDayId: "day-20", name: "RDL", sets: 3, reps: 10, weight: 70, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-64", userId: "user-1", planId: "plan-4", workoutDayId: "day-20", name: "Walking Lunges", sets: 3, reps: 20, weight: 15, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },

    // --- Plan 5: Hybrid Performance (15 Exercises total) ---
    // Monday: Strength (Day 21)
    { localId: "ex-65", userId: "user-1", planId: "plan-5", workoutDayId: "day-21", name: "Conventional DL", sets: 3, reps: 5, weight: 120, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-66", userId: "user-1", planId: "plan-5", workoutDayId: "day-21", name: "Weighted Pull Up", sets: 4, reps: 6, weight: 10, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-67", userId: "user-1", planId: "plan-5", workoutDayId: "day-21", name: "Push Press", sets: 4, reps: 6, weight: 50, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    // Tuesday: Zone 2 (Day 22)
    { localId: "ex-68", userId: "user-1", planId: "plan-5", workoutDayId: "day-22", name: "Steady Run", sets: 1, reps: null, weight: null, distance: 8, duration: 50, unit: "km", type: "Cardio", variant: "Endurance" },
    { localId: "ex-69", userId: "user-1", planId: "plan-5", workoutDayId: "day-22", name: "Mobility Flow", sets: 1, reps: null, weight: null, distance: null, duration: 15, unit: "mins", type: "Core", variant: "Endurance" },
    { localId: "ex-70", userId: "user-1", planId: "plan-5", workoutDayId: "day-22", name: "Stretching", sets: 1, reps: null, weight: null, duration: 10, unit: "mins", type: "Core", variant: "Endurance", distance: null },
    // Wednesday: Strength (Day 23)
    { localId: "ex-71", userId: "user-1", planId: "plan-5", workoutDayId: "day-23", name: "Front Squat", sets: 4, reps: 8, weight: 60, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { localId: "ex-72", userId: "user-1", planId: "plan-5", workoutDayId: "day-23", name: "Pendlay Row", sets: 4, reps: 8, weight: 70, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { localId: "ex-73", userId: "user-1", planId: "plan-5", workoutDayId: "day-23", name: "Dips", sets: 3, reps: 12, weight: 0, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    // Thursday: HIIT (Day 24)
    { localId: "ex-74", userId: "user-1", planId: "plan-5", workoutDayId: "day-24", name: "Box Jumps", sets: 5, reps: 10, weight: null, distance: null, duration: null, unit: "reps", type: "Legs", variant: "Lower" },
    { localId: "ex-75", userId: "user-1", planId: "plan-5", workoutDayId: "day-24", name: "Battle Ropes", sets: 5, reps: null, weight: null, distance: null, duration: 30, unit: "sec", type: "Push", variant: "Endurance" },
    { localId: "ex-76", userId: "user-1", planId: "plan-5", workoutDayId: "day-24", name: "Kettlebell Swings", sets: 4, reps: 20, weight: 24, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    // Friday: Recovery Run (Day 25)
    { localId: "ex-77", userId: "user-1", planId: "plan-5", workoutDayId: "day-25", name: "Light Jog", sets: 1, reps: null, weight: null, distance: 4, duration: 25, unit: "km", type: "Cardio", variant: "Endurance" },
    { localId: "ex-78", userId: "user-1", planId: "plan-5", workoutDayId: "day-25", name: "Core Circuit", sets: 3, reps: 20, weight: null, distance: null, duration: null, unit: "reps", type: "Core", variant: "Upper" },
    { localId: "ex-79", userId: "user-1", planId: "plan-5", workoutDayId: "day-25", name: "Foam Rolling", sets: 1, reps: null, weight: null, duration: 15, unit: "mins", type: "Core", variant: "Endurance", distance: null },
];

const initialSessions: WorkoutSession[] = [
    {
        localId: "session-1",
        userId: "user-1",
        date: getDateKey(),
        sessionLength: null,
        perfectDay: false,
    },
];

const initialLogs: ExerciseLog[] = [
    {
        localId: "log-1",
        userId: "user-1",
        sessionId: "session-1",
        exerciseId: "ex-1",
        reps: 8,
        weight: 60,
        duration: null,
        distance: null,
        completed: true,
        date: getDateKey(),
    },
    {
        localId: "log-2",
        userId: "user-1",
        sessionId: "session-1",
        exerciseId: "ex-5",
        reps: 10,
        weight: 50,
        duration: null,
        distance: null,
        completed: true,
        date: getDateKey(),
    },
];

// Helper to compute max ID from an array
const generateUUID = () => randomUUID();

// Generate unique IDs
let nextUserId = generateUUID();
let nextPlanId = generateUUID();
let nextDayId = generateUUID();
let nextExerciseId = generateUUID();
let nextSessionId = generateUUID();
let nextLogId = generateUUID();

// Function to reset ID counters
const resetIdCounters = () => {
    nextUserId = generateUUID();
    nextPlanId = generateUUID();
    nextDayId = generateUUID();
    nextExerciseId = generateUUID();
    nextSessionId = generateUUID();
    nextLogId = generateUUID();
};

const generateUserId = () => {
    const id = nextUserId;
    nextUserId = generateUUID();
    return id;
};
const generatePlanId = () => {
    const id = nextPlanId;
    nextPlanId = generateUUID();
    return id;
};
const generateDayId = () => {
    const id = nextDayId;
    nextDayId = generateUUID();
    return id;
};
const generateExerciseId = () => {
    const id = nextExerciseId;
    nextExerciseId = generateUUID();
    return id;
};
const generateSessionId = () => {
    const id = nextSessionId;
    nextSessionId = generateUUID();
    return id;
};
const generateLogId = () => {
    const id = nextLogId;
    nextLogId = generateUUID();
    return id;
};

interface StaticStoreState {
    // Data
    users: User[];
    plans: WorkoutPlan[];
    workoutDays: WorkoutDay[];
    exercises: Exercise[];
    sessions: WorkoutSession[];
    logs: ExerciseLog[];

    // Current user
    currentUserId: string | null;

    // Actions - User
    setCurrentUser: (userId: string | null) => void;
    createUser: (name: string, profile?: string | null) => User;
    updateUser: (id: string, data: Partial<User>) => User | null;

    // Actions - Plans
    createPlan: (data: Omit<WorkoutPlan, "localId" | "createdAt" | "userId">) => WorkoutPlan;
    updatePlan: (id: string, data: Partial<WorkoutPlan>) => WorkoutPlan | null;
    deletePlan: (planId: string) => boolean;

    // Actions - Workout Days
    createWorkoutDay: (data: Omit<WorkoutDay, "localId">) => WorkoutDay;
    updateWorkoutDay: (id: string, data: Partial<WorkoutDay>) => WorkoutDay | null;
    deleteWorkoutDay: (dayId: string) => boolean;

    // Actions - Exercises
    createExercise: (data: Omit<Exercise, "localId">) => Exercise;
    updateExercise: (id: string, data: Partial<Exercise>) => Exercise | null;
    deleteExercise: (exerciseId: string) => boolean;

    // Actions - Sessions
    createSession: (data: Omit<WorkoutSession, "localId">) => WorkoutSession;
    updateSession: (id: string, data: Partial<WorkoutSession>) => WorkoutSession | null;
    getOrCreateTodaySession: (userId: string) => WorkoutSession;

    // Actions - Logs
    createLog: (data: Omit<ExerciseLog, "localId">) => ExerciseLog;
    updateLog: (id: string, data: Partial<ExerciseLog>) => ExerciseLog | null;
    deleteLog: (logId: string) => boolean;

    // Query helpers
    getUserWithRelations: (userId: string) => UserWithRelations | null;
    getPlanWithDays: (planId: string) => WorkoutPlanWithDays | null;
    getLogsForExercise: (exerciseId: string, limit?: number) => ExerciseLog[];
    getTodayLogs: (userId: string) => ExerciseLog[];

    // Internal helpers
    updateSessionPerfectDay: (sessionId: string) => void;

    // Reset
    resetToInitial: () => void;
}

// Store the initial state for reset
const getInitialState = () => ({
    users: [...initialUsers],
    plans: [...initialPlans],
    workoutDays: [...initialWorkoutDays],
    exercises: [...initialExercises],
    sessions: [...initialSessions],
    logs: [...initialLogs],
    currentUserId: "user-1",
});

export const useStaticStore = create<StaticStoreState>((set, get) => {
    const initialState = getInitialState();

    return {
        ...initialState,

        // User actions
        setCurrentUser: (userId) => set({ currentUserId: userId }),

        createUser: (name, profile = null) => {
            const id = generateUserId();
            const newUser: User = { localId: id, name, profile, createdAt: new Date().toISOString() };
            set((state) => ({ users: [...state.users, newUser] }));
            return newUser;
        },

        updateUser: (id, data) => {
            const state = get();
            const user = state.users.find((u) => u.localId === id);
            if (!user) return null;
            const updated = { ...user, ...data };
            set((state) => ({ users: state.users.map((u) => (u.localId === id ? updated : u)) }));
            return updated;
        },

        // Plan actions
        createPlan: (data) => {
            const state = get();
            const id = generatePlanId();
            const newPlan: WorkoutPlan = { ...data, localId: id, userId: state.currentUserId || "user-1", createdAt: new Date().toISOString() };
            set((state) => ({ plans: [...state.plans, newPlan] }));
            return newPlan;
        },

        updatePlan: (id, data) => {
            const state = get();
            const plan = state.plans.find((p) => p.localId === id);
            if (!plan) return null;
            const updated = { ...plan, ...data };
            set((state) => ({ plans: state.plans.map((p) => (p.localId === id ? updated : p)) }));
            return updated;
        },

        deletePlan: (planId) => {
            const state = get();
            const plan = state.plans.find((p) => p.localId === planId);
            if (!plan) return false;

            // Delete related days and exercises
            const daysToDelete = state.workoutDays.filter((d) => d.planId === planId);
            const dayIds = daysToDelete.map((d) => d.localId);
            const exercisesToDelete = state.exercises.filter((e) => dayIds.includes(e.workoutDayId));
            const exerciseIds = exercisesToDelete.map((e) => e.localId);

            set((state) => ({
                plans: state.plans.filter((p) => p.localId !== planId),
                workoutDays: state.workoutDays.filter((d) => d.planId !== planId),
                exercises: state.exercises.filter((e) => !dayIds.includes(e.workoutDayId)),
                logs: state.logs.filter((l) => !exerciseIds.includes(l.exerciseId)),
            }));
            return true;
        },

        // Workout Day actions
        createWorkoutDay: (data) => {
            const id = generateDayId();
            const newDay: WorkoutDay = { ...data, localId: id };
            set((state) => ({ workoutDays: [...state.workoutDays, newDay] }));
            return newDay;
        },

        updateWorkoutDay: (id, data) => {
            const state = get();
            const day = state.workoutDays.find((d) => d.localId === id);
            if (!day) return null;
            const updated = { ...day, ...data };
            set((state) => ({ workoutDays: state.workoutDays.map((d) => (d.localId === id ? updated : d)) }));
            return updated;
        },

        deleteWorkoutDay: (dayId) => {
            const state = get();
            const day = state.workoutDays.find((d) => d.localId === dayId);
            if (!day) return false;

            const exercisesToDelete = state.exercises.filter((e) => e.workoutDayId === dayId);
            const exerciseIds = exercisesToDelete.map((e) => e.localId);

            set((state) => ({
                workoutDays: state.workoutDays.filter((d) => d.localId !== dayId),
                exercises: state.exercises.filter((e) => e.workoutDayId !== dayId),
                logs: state.logs.filter((l) => !exerciseIds.includes(l.exerciseId)),
            }));
            return true;
        },

        // Exercise actions
        createExercise: (data) => {
            const id = generateExerciseId();
            const newExercise: Exercise = { ...data, localId: id };
            set((state) => ({ exercises: [...state.exercises, newExercise] }));
            return newExercise;
        },

        updateExercise: (id, data) => {
            const state = get();
            const exercise = state.exercises.find((e) => e.localId === id);
            if (!exercise) return null;
            const updated = { ...exercise, ...data };
            set((state) => ({ exercises: state.exercises.map((e) => (e.localId === id ? updated : e)) }));
            return updated;
        },

        deleteExercise: (exerciseId) => {
            const state = get();
            const exercise = state.exercises.find((e) => e.localId === exerciseId);
            if (!exercise) return false;

            set((state) => ({
                exercises: state.exercises.filter((e) => e.localId !== exerciseId),
                logs: state.logs.filter((l) => l.exerciseId !== exerciseId),
            }));
            return true;
        },

        // Session actions
        createSession: (data) => {
            const id = generateSessionId();
            const newSession: WorkoutSession = { ...data, localId: id };
            set((state) => ({ sessions: [...state.sessions, newSession] }));
            return newSession;
        },

        updateSession: (id, data) => {
            const state = get();
            const session = state.sessions.find((s) => s.localId === id);
            if (!session) return null;
            const updated = { ...session, ...data };
            set((state) => ({ sessions: state.sessions.map((s) => (s.localId === id ? updated : s)) }));
            return updated;
        },

        getOrCreateTodaySession: (userId) => {
            const state = get();
            const todayKey = getDateKey();
            let session = state.sessions.find((s) => s.userId === userId && s.date === todayKey);

            if (!session) {
                session = get().createSession({ userId, date: todayKey, sessionLength: null, perfectDay: false });
            }

            return session;
        },

        // Log actions
        createLog: (data) => {
            const id = generateLogId();
            const newLog: ExerciseLog = { ...data, localId: id };
            set((state) => ({ logs: [...state.logs, newLog] }));

            // Update perfect day status
            const session = get().sessions.find((s) => s.localId === data.sessionId);
            if (session) {
                get().updateSessionPerfectDay(session.localId);
            }

            return newLog;
        },

        updateLog: (id, data) => {
            const state = get();
            const log = state.logs.find((l) => l.localId === id);
            if (!log) return null;
            const updated = { ...log, ...data };
            set((state) => ({ logs: state.logs.map((l) => (l.localId === id ? updated : l)) }));

            // Update perfect day status
            get().updateSessionPerfectDay(log.sessionId);

            return updated;
        },

        deleteLog: (logId) => {
            const state = get();
            const log = state.logs.find((l) => l.localId === logId);
            if (!log) return false;

            set((state) => ({ logs: state.logs.filter((l) => l.localId !== logId) }));

            // Update perfect day status
            get().updateSessionPerfectDay(log.sessionId);

            return true;
        },

        // Helper to update session perfect day
        updateSessionPerfectDay: (sessionId) => {
            const state = get();
            const session = state.sessions.find((s) => s.localId === sessionId);
            if (!session) return;

            // Get all logs for this session
            const sessionLogs = state.logs.filter((l) => l.sessionId === sessionId);

            // Get the exercise that was just logged
            if (sessionLogs.length === 0) {
                get().updateSession(sessionId, { perfectDay: false });
                return;
            }

            const lastExerciseId = sessionLogs[sessionLogs.length - 1].exerciseId;
            const exercise = state.exercises.find((e) => e.localId === lastExerciseId);
            if (!exercise) return;

            // Get the workout day
            const workoutDay = state.workoutDays.find((d) => d.localId === exercise.workoutDayId);
            if (!workoutDay) return;

            // Get all exercises for this workout day
            const dayExercises = state.exercises.filter((e) => e.workoutDayId === workoutDay.localId);

            // Check if all exercises have enough completed sets
            const isPerfect = dayExercises.every((dayExercise) => {
                const targetSets = dayExercise.sets ?? 1;
                const completedSets = sessionLogs.filter((l) => l.exerciseId === dayExercise.localId).length;
                return completedSets >= targetSets;
            });

            get().updateSession(sessionId, { perfectDay: isPerfect });
        },

        // Query helpers
        getUserWithRelations: (userId) => {
            const state = get();
            const user = state.users.find((u) => u.localId === userId);
            if (!user) return null;

            const userPlans = state.plans.filter((p) => p.userId === userId);
            const userSessions = state.sessions.filter((s) => s.userId === userId);

            const plansWithDays = userPlans.map((plan) => {
                const planDays = state.workoutDays.filter((d) => d.planId === plan.localId);

                const daysWithExercises = planDays.map((day) => {
                    const dayExercises = state.exercises.filter((e) => e.workoutDayId === day.localId);

                    const exercisesWithLogs = dayExercises.map((exercise) => ({
                        ...exercise,
                        logs: state.logs.filter((l) => l.exerciseId === exercise.localId),
                    }));

                    return { ...day, exercises: exercisesWithLogs };
                });

                return { ...plan, days: daysWithExercises };
            });

            const sessionsWithLogs = userSessions.map((session) => {
                const sessionLogs = state.logs.filter((l) => l.sessionId === session.localId);

                const logsWithExercise = sessionLogs.map((log) => {
                    const exercise = state.exercises.find((e) => e.localId === log.exerciseId);
                    return {
                        ...log,
                        exercise: exercise || ({} as Exercise),
                    };
                });

                return { ...session, logs: logsWithExercise };
            });

            return { ...user, plans: plansWithDays, sessions: sessionsWithLogs };
        },

        getPlanWithDays: (planId) => {
            const state = get();
            const plan = state.plans.find((p) => p.localId === planId);
            if (!plan) return null;

            const planDays = state.workoutDays.filter((d) => d.planId === plan.localId);
            const daysWithExercises = planDays.map((day) => {
                const dayExercises = state.exercises.filter((e) => e.workoutDayId === day.localId);
                const exercisesWithLogs = dayExercises.map((exercise) => ({
                    ...exercise,
                    logs: state.logs.filter((l) => l.exerciseId === exercise.localId),
                }));
                return { ...day, exercises: exercisesWithLogs };
            });

            return { ...plan, days: daysWithExercises };
        },

        getLogsForExercise: (exerciseId, limit = 6) => {
            const state = get();
            return state.logs
                .filter((l) => l.exerciseId === exerciseId)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, limit);
        },

        getTodayLogs: (userId) => {
            const state = get();
            const todayKey = getDateKey();
            return state.logs.filter((l) => l.userId === userId && l.date === todayKey);
        },

        // Reset
        resetToInitial: () => {
            resetIdCounters();
            const initial = getInitialState();
            set(initial);
        },
    };
});
