import { create } from "zustand";
import { getDateKey } from "@/lib/helper-functions";

export interface User {
    id: number;
    name: string;
    profile: string | null;
    createdAt: string;
}

export interface WorkoutPlan {
    id: number;
    userId: number;
    workoutDaysPerWeek: number;
    split: WorkoutSplit;
    goal: Goal | null;
    fitnessLevel: FitnessLevel | null;
    createdAt: string;
}

export interface WorkoutDay {
    id: number;
    userId: number;
    planId: number;
    dayName: Weekday;
}

export interface Exercise {
    id: number;
    userId: number;
    planId: number;
    workoutDayId: number;
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
    id: number;
    userId: number;
    date: string;
    sessionLength: number | null;
    perfectDay: boolean;
}

export interface ExerciseLog {
    id: number;
    userId: number;
    sessionId: number;
    exerciseId: number;
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

// Generate unique IDs
let nextUserId = 1;
let nextPlanId = 1;
let nextDayId = 1;
let nextExerciseId = 1;
let nextSessionId = 1;
let nextLogId = 1;

const generateUserId = () => nextUserId++;
const generatePlanId = () => nextPlanId++;
const generateDayId = () => nextDayId++;
const generateExerciseId = () => nextExerciseId++;
const generateSessionId = () => nextSessionId++;
const generateLogId = () => nextLogId++;

// Initial static data with 2 plans
const initialUsers: User[] = [
    {
        id: 1,
        name: "Malcom",
        profile: null,
        createdAt: new Date().toISOString(),
    },
];

const initialPlans: WorkoutPlan[] = [
    { id: 1, userId: 1, workoutDaysPerWeek: 6, split: "Push Pull Leg", goal: "Hypertrophy", fitnessLevel: "Advanced", createdAt: new Date().toISOString() },
    { id: 2, userId: 1, workoutDaysPerWeek: 4, split: "Upper Lower", goal: "Strength", fitnessLevel: "Intermediate", createdAt: new Date().toISOString() },
    { id: 3, userId: 1, workoutDaysPerWeek: 3, split: "Full Body", goal: "Endurance", fitnessLevel: "Beginner", createdAt: new Date().toISOString() },
    { id: 4, userId: 1, workoutDaysPerWeek: 6, split: "Arnold Split", goal: "Hypertrophy", fitnessLevel: "Advanced", createdAt: new Date().toISOString() },
    { id: 5, userId: 1, workoutDaysPerWeek: 5, split: "Hybrid Performance", goal: "Fat Loss", fitnessLevel: "Intermediate", createdAt: new Date().toISOString() },
];

const initialWorkoutDays: WorkoutDay[] = [
    // Plan 1 - Push Pull Leg
    { id: 1, userId: 1, planId: 1, dayName: "Monday" },
    { id: 2, userId: 1, planId: 1, dayName: "Tuesday" },
    { id: 3, userId: 1, planId: 1, dayName: "Wednesday" },
    { id: 4, userId: 1, planId: 1, dayName: "Thursday" },
    { id: 5, userId: 1, planId: 1, dayName: "Friday" },
    { id: 6, userId: 1, planId: 1, dayName: "Saturday" },
    { id: 7, userId: 1, planId: 1, dayName: "Sunday" },

    // Plan 2 - Upper Lower
    { id: 8, userId: 1, planId: 2, dayName: "Monday" },
    { id: 9, userId: 1, planId: 2, dayName: "Tuesday" },
    { id: 10, userId: 1, planId: 2, dayName: "Wednesday" },
    { id: 11, userId: 1, planId: 2, dayName: "Thursday" },

    // Plan 3 - Full Body
    { id: 12, userId: 1, planId: 3, dayName: "Monday" },
    { id: 13, userId: 1, planId: 3, dayName: "Wednesday" },
    { id: 14, userId: 1, planId: 3, dayName: "Friday" },

    // Plan 4 - Arnold Split
    { id: 15, userId: 1, planId: 4, dayName: "Monday" },
    { id: 16, userId: 1, planId: 4, dayName: "Tuesday" },
    { id: 17, userId: 1, planId: 4, dayName: "Wednesday" },
    { id: 18, userId: 1, planId: 4, dayName: "Thursday" },
    { id: 19, userId: 1, planId: 4, dayName: "Friday" },
    { id: 20, userId: 1, planId: 4, dayName: "Saturday" },

    // Plan 5 - Hybrid
    { id: 21, userId: 1, planId: 5, dayName: "Monday" },
    { id: 22, userId: 1, planId: 5, dayName: "Tuesday" },
    { id: 23, userId: 1, planId: 5, dayName: "Wednesday" },
    { id: 24, userId: 1, planId: 5, dayName: "Thursday" },
    { id: 25, userId: 1, planId: 5, dayName: "Friday" },
];

const initialExercises: Exercise[] = [
    // Plan 1 - Push Pull Leg exercises
    // Monday - Push
    { id: 1, userId: 1, planId: 1, workoutDayId: 1, name: "Bench Press", sets: 4, reps: 8, weight: 60, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 2, userId: 1, planId: 1, workoutDayId: 1, name: "Overhead Press", sets: 3, reps: 10, weight: 40, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 3, userId: 1, planId: 1, workoutDayId: 1, name: "Incline Dumbbell Press", sets: 3, reps: 10, weight: 25, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 4, userId: 1, planId: 1, workoutDayId: 1, name: "Tricep Push down", sets: 3, reps: 12, weight: 25, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    // Tuesday - Pull
    { id: 5, userId: 1, planId: 1, workoutDayId: 2, name: "Lat Pulldown", sets: 4, reps: 10, weight: 50, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 6, userId: 1, planId: 1, workoutDayId: 2, name: "Barbell Row", sets: 4, reps: 8, weight: 50, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 7, userId: 1, planId: 1, workoutDayId: 2, name: "Face Pulls", sets: 3, reps: 15, weight: 15, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 8, userId: 1, planId: 1, workoutDayId: 2, name: "Hammer Curls", sets: 3, reps: 12, weight: 12, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    // Wednesday - Legs
    { id: 9, userId: 1, planId: 1, workoutDayId: 3, name: "Squat", sets: 4, reps: 6, weight: 90, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 10, userId: 1, planId: 1, workoutDayId: 3, name: "Romanian Dead lift", sets: 3, reps: 8, weight: 70, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Lower" },
    { id: 11, userId: 1, planId: 1, workoutDayId: 3, name: "Leg Press", sets: 3, reps: 12, weight: 150, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 12, userId: 1, planId: 1, workoutDayId: 3, name: "Calf Raises", sets: 4, reps: 15, weight: 40, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    // Thursday - Push
    { id: 13, userId: 1, planId: 1, workoutDayId: 4, name: "Shoulder Press", sets: 3, reps: 10, weight: 30, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 14, userId: 1, planId: 1, workoutDayId: 4, name: "Lateral Raises", sets: 3, reps: 15, weight: 10, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 15, userId: 1, planId: 1, workoutDayId: 4, name: "Bike Intervals", sets: 1, reps: null, weight: null, distance: 8, duration: 20, unit: "km", type: "Cardio", variant: "Endurance" },
    // Friday - Pull
    { id: 16, userId: 1, planId: 1, workoutDayId: 5, name: "Pull Ups", sets: 3, reps: 10, weight: 0, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 17, userId: 1, planId: 1, workoutDayId: 5, name: "Cable Row", sets: 3, reps: 12, weight: 40, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 18, userId: 1, planId: 1, workoutDayId: 5, name: "Rear Delt Fly", sets: 3, reps: 15, weight: 8, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    // Saturday - Legs
    { id: 19, userId: 1, planId: 1, workoutDayId: 6, name: "Dead lift", sets: 3, reps: 5, weight: 100, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 20, userId: 1, planId: 1, workoutDayId: 6, name: "Bulgarian Split Squat", sets: 3, reps: 10, weight: 20, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 21, userId: 1, planId: 1, workoutDayId: 6, name: "Leg Curls", sets: 3, reps: 12, weight: 30, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    // Sunday - Rest/Active Recovery
    { id: 22, userId: 1, planId: 1, workoutDayId: 7, name: "Light Jog", sets: 1, reps: null, weight: null, distance: 5, duration: 30, unit: "km", type: "Cardio", variant: "Endurance" },
    { id: 23, userId: 1, planId: 1, workoutDayId: 7, name: "Stretching", sets: 1, reps: null, weight: null, distance: null, duration: 20, unit: "mins", type: "Core", variant: "Endurance" },

    // Plan 2 - Upper Lower exercises
    // Monday - Upper
    { id: 24, userId: 1, planId: 2, workoutDayId: 8, name: "Bench Press", sets: 5, reps: 5, weight: 70, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 25, userId: 1, planId: 2, workoutDayId: 8, name: "Weighted Pull Ups", sets: 4, reps: 6, weight: 10, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 26, userId: 1, planId: 2, workoutDayId: 8, name: "Military Press", sets: 4, reps: 6, weight: 45, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 27, userId: 1, planId: 2, workoutDayId: 8, name: "Pendlay Row", sets: 4, reps: 6, weight: 60, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    // Tuesday - Lower
    { id: 28, userId: 1, planId: 2, workoutDayId: 9, name: "Back Squat", sets: 5, reps: 5, weight: 100, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 29, userId: 1, planId: 2, workoutDayId: 9, name: "Front Squat", sets: 3, reps: 8, weight: 70, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 30, userId: 1, planId: 2, workoutDayId: 9, name: "Stiff Leg Dead lift", sets: 3, reps: 8, weight: 80, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    // Thursday - Upper
    { id: 31, userId: 1, planId: 2, workoutDayId: 10, name: "Incline Bench Press", sets: 4, reps: 8, weight: 55, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 32, userId: 1, planId: 2, workoutDayId: 10, name: "T-Bar Row", sets: 4, reps: 8, weight: 50, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 33, userId: 1, planId: 2, workoutDayId: 10, name: "Dips", sets: 3, reps: 10, weight: 0, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 34, userId: 1, planId: 2, workoutDayId: 10, name: "Chin Ups", sets: 3, reps: 8, weight: 0, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    // Friday - Lower
    { id: 35, userId: 1, planId: 2, workoutDayId: 11, name: "Conventional Dead lift", sets: 3, reps: 5, weight: 120, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 36, userId: 1, planId: 2, workoutDayId: 11, name: "Walking Lunges", sets: 3, reps: 12, weight: 20, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 37, userId: 1, planId: 2, workoutDayId: 11, name: "Leg Extensions", sets: 3, reps: 15, weight: 40, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },

    // --- Plan 3: Full Body (9 Exercises total) ---
    // Monday (Day 12)
    { id: 38, userId: 1, planId: 3, workoutDayId: 12, name: "Goblet Squats", sets: 3, reps: 12, weight: 20, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 39, userId: 1, planId: 3, workoutDayId: 12, name: "Push Ups", sets: 3, reps: 15, weight: 0, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 40, userId: 1, planId: 3, workoutDayId: 12, name: "Plank", sets: 3, reps: null, weight: null, distance: null, duration: 60, unit: "sec", type: "Core", variant: "Endurance" },
    // Wednesday (Day 13)
    { id: 41, userId: 1, planId: 3, workoutDayId: 13, name: "Lunges", sets: 3, reps: 10, weight: 15, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 42, userId: 1, planId: 3, workoutDayId: 13, name: "Dumbbell Row", sets: 3, reps: 12, weight: 18, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 43, userId: 1, planId: 3, workoutDayId: 13, name: "Overhead Press", sets: 3, reps: 10, weight: 12, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    // Friday (Day 14)
    { id: 44, userId: 1, planId: 3, workoutDayId: 14, name: "Deadlift", sets: 3, reps: 8, weight: 40, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 45, userId: 1, planId: 3, workoutDayId: 14, name: "Chest Press", sets: 3, reps: 12, weight: 14, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 46, userId: 1, planId: 3, workoutDayId: 14, name: "Lat Pulldown", sets: 3, reps: 10, weight: 35, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },

    // --- Plan 4: Arnold Split (18 Exercises total) ---
    // Monday & Thursday: Chest & Back (Days 15, 18)
    { id: 47, userId: 1, planId: 4, workoutDayId: 15, name: "Incline Bench", sets: 4, reps: 8, weight: 65, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 48, userId: 1, planId: 4, workoutDayId: 15, name: "Pull Ups", sets: 4, reps: 10, weight: 0, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 49, userId: 1, planId: 4, workoutDayId: 15, name: "Dumbbell Flys", sets: 3, reps: 12, weight: 16, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    // Tuesday & Friday: Shoulders & Arms (Days 16, 19)
    { id: 50, userId: 1, planId: 4, workoutDayId: 16, name: "Military Press", sets: 4, reps: 8, weight: 45, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 51, userId: 1, planId: 4, workoutDayId: 16, name: "Barbell Curls", sets: 3, reps: 12, weight: 30, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 52, userId: 1, planId: 4, workoutDayId: 16, name: "Skull Crushers", sets: 3, reps: 12, weight: 25, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    // Wednesday & Saturday: Legs (Days 17, 20)
    { id: 53, userId: 1, planId: 4, workoutDayId: 17, name: "Back Squat", sets: 4, reps: 6, weight: 100, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 54, userId: 1, planId: 4, workoutDayId: 17, name: "Leg Curls", sets: 3, reps: 12, weight: 40, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 55, userId: 1, planId: 4, workoutDayId: 17, name: "Calf Raises", sets: 4, reps: 15, weight: 60, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    // (Repeat for Days 18, 19, 20 with unique IDs)
    { id: 56, userId: 1, planId: 4, workoutDayId: 18, name: "T-Bar Row", sets: 4, reps: 8, weight: 50, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 57, userId: 1, planId: 4, workoutDayId: 18, name: "Chest Dips", sets: 3, reps: 10, weight: 0, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 58, userId: 1, planId: 4, workoutDayId: 18, name: "Face Pulls", sets: 3, reps: 15, weight: 20, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },

    { id: 59, userId: 1, planId: 4, workoutDayId: 19, name: "Lateral Raises", sets: 4, reps: 15, weight: 10, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    { id: 60, userId: 1, planId: 4, workoutDayId: 19, name: "Hammer Curls", sets: 3, reps: 12, weight: 14, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 61, userId: 1, planId: 4, workoutDayId: 19, name: "Tricep Ext", sets: 3, reps: 12, weight: 20, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },

    { id: 62, userId: 1, planId: 4, workoutDayId: 20, name: "Leg Press", sets: 3, reps: 10, weight: 160, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 63, userId: 1, planId: 4, workoutDayId: 20, name: "RDL", sets: 3, reps: 10, weight: 70, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 64, userId: 1, planId: 4, workoutDayId: 20, name: "Walking Lunges", sets: 3, reps: 20, weight: 15, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },

    // --- Plan 5: Hybrid Performance (15 Exercises total) ---
    // Monday: Strength (Day 21)
    { id: 65, userId: 1, planId: 5, workoutDayId: 21, name: "Conventional DL", sets: 3, reps: 5, weight: 120, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 66, userId: 1, planId: 5, workoutDayId: 21, name: "Weighted Pull Up", sets: 4, reps: 6, weight: 10, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 67, userId: 1, planId: 5, workoutDayId: 21, name: "Push Press", sets: 4, reps: 6, weight: 50, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    // Tuesday: Zone 2 (Day 22)
    { id: 68, userId: 1, planId: 5, workoutDayId: 22, name: "Steady Run", sets: 1, reps: null, weight: null, distance: 8, duration: 50, unit: "km", type: "Cardio", variant: "Endurance" },
    { id: 69, userId: 1, planId: 5, workoutDayId: 22, name: "Mobility Flow", sets: 1, reps: null, weight: null, distance: null, duration: 15, unit: "mins", type: "Core", variant: "Endurance" },
    { id: 70, userId: 1, planId: 5, workoutDayId: 22, name: "Stretching", sets: 1, reps: null, weight: null, distance: null, duration: 10, unit: "mins", type: "Core", variant: "Endurance" },
    // Wednesday: Strength (Day 23)
    { id: 71, userId: 1, planId: 5, workoutDayId: 23, name: "Front Squat", sets: 4, reps: 8, weight: 60, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    { id: 72, userId: 1, planId: 5, workoutDayId: 23, name: "Pendlay Row", sets: 4, reps: 8, weight: 70, distance: null, duration: null, unit: "kg", type: "Pull", variant: "Upper" },
    { id: 73, userId: 1, planId: 5, workoutDayId: 23, name: "Dips", sets: 3, reps: 12, weight: 0, distance: null, duration: null, unit: "kg", type: "Push", variant: "Upper" },
    // Thursday: HIIT (Day 24)
    { id: 74, userId: 1, planId: 5, workoutDayId: 24, name: "Box Jumps", sets: 5, reps: 10, weight: null, distance: null, duration: null, unit: "reps", type: "Legs", variant: "Lower" },
    { id: 75, userId: 1, planId: 5, workoutDayId: 24, name: "Battle Ropes", sets: 5, reps: null, weight: null, distance: null, duration: 30, unit: "sec", type: "Push", variant: "Endurance" },
    { id: 76, userId: 1, planId: 5, workoutDayId: 24, name: "Kettlebell Swings", sets: 4, reps: 20, weight: 24, distance: null, duration: null, unit: "kg", type: "Legs", variant: "Lower" },
    // Friday: Recovery Run (Day 25)
    { id: 77, userId: 1, planId: 5, workoutDayId: 25, name: "Light Jog", sets: 1, reps: null, weight: null, distance: 4, duration: 25, unit: "km", type: "Cardio", variant: "Endurance" },
    { id: 78, userId: 1, planId: 5, workoutDayId: 25, name: "Core Circuit", sets: 3, reps: 20, weight: null, distance: null, duration: null, unit: "reps", type: "Core", variant: "Upper" },
    { id: 79, userId: 1, planId: 5, workoutDayId: 25, name: "Foam Rolling", sets: 1, reps: null, weight: null, distance: null, duration: 15, unit: "mins", type: "Core", variant: "Endurance" },
];

const initialSessions: WorkoutSession[] = [
    {
        id: 1,
        userId: 1,
        date: getDateKey(),
        sessionLength: null,
        perfectDay: false,
    },
];

const initialLogs: ExerciseLog[] = [
    {
        id: 1,
        userId: 1,
        sessionId: 1,
        exerciseId: 1,
        reps: 8,
        weight: 60,
        duration: null,
        distance: null,
        completed: true,
        date: getDateKey(),
    },
    {
        id: 2,
        userId: 1,
        sessionId: 1,
        exerciseId: 5,
        reps: 10,
        weight: 50,
        duration: null,
        distance: null,
        completed: true,
        date: getDateKey(),
    },
];

interface StaticStoreState {
    // Data
    users: User[];
    plans: WorkoutPlan[];
    workoutDays: WorkoutDay[];
    exercises: Exercise[];
    sessions: WorkoutSession[];
    logs: ExerciseLog[];

    // Current user
    currentUserId: number | null;

    // Actions - User
    setCurrentUser: (userId: number | null) => void;
    createUser: (name: string, profile?: string | null) => User;
    updateUser: (id: number, data: Partial<User>) => User | null;

    // Actions - Plans
    createPlan: (data: Omit<WorkoutPlan, "id" | "createdAt" | "userId">) => WorkoutPlan;
    updatePlan: (id: number, data: Partial<WorkoutPlan>) => WorkoutPlan | null;
    deletePlan: (planId: number) => boolean;

    // Actions - Workout Days
    createWorkoutDay: (data: Omit<WorkoutDay, "id">) => WorkoutDay;
    updateWorkoutDay: (id: number, data: Partial<WorkoutDay>) => WorkoutDay | null;
    deleteWorkoutDay: (dayId: number) => boolean;

    // Actions - Exercises
    createExercise: (data: Omit<Exercise, "id">) => Exercise;
    updateExercise: (id: number, data: Partial<Exercise>) => Exercise | null;
    deleteExercise: (exerciseId: number) => boolean;

    // Actions - Sessions
    createSession: (data: Omit<WorkoutSession, "id">) => WorkoutSession;
    updateSession: (id: number, data: Partial<WorkoutSession>) => WorkoutSession | null;
    getOrCreateTodaySession: (userId: number) => WorkoutSession;

    // Actions - Logs
    createLog: (data: Omit<ExerciseLog, "id">) => ExerciseLog;
    updateLog: (id: number, data: Partial<ExerciseLog>) => ExerciseLog | null;
    deleteLog: (logId: number) => boolean;

    // Query helpers
    getUserWithRelations: (userId: number) => UserWithRelations | null;
    getPlanWithDays: (planId: number) => WorkoutPlanWithDays | null;
    getLogsForExercise: (exerciseId: number, limit?: number) => ExerciseLog[];
    getTodayLogs: (userId: number) => ExerciseLog[];

    // Internal helpers
    updateSessionPerfectDay: (sessionId: number) => void;

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
    currentUserId: 1,
});

export const useStaticStore = create<StaticStoreState>((set, get) => {
    const initialState = getInitialState();

    return {
        ...initialState,

        // User actions
        setCurrentUser: (userId) => set({ currentUserId: userId }),

        createUser: (name, profile = null) => {
            const id = generateUserId();
            const newUser: User = { id, name, profile, createdAt: new Date().toISOString() };
            set((state) => ({ users: [...state.users, newUser] }));
            return newUser;
        },

        updateUser: (id, data) => {
            const state = get();
            const user = state.users.find((u) => u.id === id);
            if (!user) return null;
            const updated = { ...user, ...data };
            set((state) => ({ users: state.users.map((u) => (u.id === id ? updated : u)) }));
            return updated;
        },

        // Plan actions
        createPlan: (data) => {
            const state = get();
            const id = generatePlanId();
            const newPlan: WorkoutPlan = { ...data, id, userId: state.currentUserId || 1, createdAt: new Date().toISOString() };
            set((state) => ({ plans: [...state.plans, newPlan] }));
            return newPlan;
        },

        updatePlan: (id, data) => {
            const state = get();
            const plan = state.plans.find((p) => p.id === id);
            if (!plan) return null;
            const updated = { ...plan, ...data };
            set((state) => ({ plans: state.plans.map((p) => (p.id === id ? updated : p)) }));
            return updated;
        },

        deletePlan: (planId) => {
            const state = get();
            const plan = state.plans.find((p) => p.id === planId);
            if (!plan) return false;

            // Delete related days and exercises
            const daysToDelete = state.workoutDays.filter((d) => d.planId === planId);
            const dayIds = daysToDelete.map((d) => d.id);
            const exercisesToDelete = state.exercises.filter((e) => dayIds.includes(e.workoutDayId));
            const exerciseIds = exercisesToDelete.map((e) => e.id);

            set((state) => ({
                plans: state.plans.filter((p) => p.id !== planId),
                workoutDays: state.workoutDays.filter((d) => d.planId !== planId),
                exercises: state.exercises.filter((e) => !dayIds.includes(e.workoutDayId)),
                logs: state.logs.filter((l) => !exerciseIds.includes(l.exerciseId)),
            }));
            return true;
        },

        // Workout Day actions
        createWorkoutDay: (data) => {
            const id = generateDayId();
            const newDay: WorkoutDay = { ...data, id };
            set((state) => ({ workoutDays: [...state.workoutDays, newDay] }));
            return newDay;
        },

        updateWorkoutDay: (id, data) => {
            const state = get();
            const day = state.workoutDays.find((d) => d.id === id);
            if (!day) return null;
            const updated = { ...day, ...data };
            set((state) => ({ workoutDays: state.workoutDays.map((d) => (d.id === id ? updated : d)) }));
            return updated;
        },

        deleteWorkoutDay: (dayId) => {
            const state = get();
            const day = state.workoutDays.find((d) => d.id === dayId);
            if (!day) return false;

            const exercisesToDelete = state.exercises.filter((e) => e.workoutDayId === dayId);
            const exerciseIds = exercisesToDelete.map((e) => e.id);

            set((state) => ({
                workoutDays: state.workoutDays.filter((d) => d.id !== dayId),
                exercises: state.exercises.filter((e) => e.workoutDayId !== dayId),
                logs: state.logs.filter((l) => !exerciseIds.includes(l.exerciseId)),
            }));
            return true;
        },

        // Exercise actions
        createExercise: (data) => {
            const id = generateExerciseId();
            const newExercise: Exercise = { ...data, id };
            set((state) => ({ exercises: [...state.exercises, newExercise] }));
            return newExercise;
        },

        updateExercise: (id, data) => {
            const state = get();
            const exercise = state.exercises.find((e) => e.id === id);
            if (!exercise) return null;
            const updated = { ...exercise, ...data };
            set((state) => ({ exercises: state.exercises.map((e) => (e.id === id ? updated : e)) }));
            return updated;
        },

        deleteExercise: (exerciseId) => {
            const state = get();
            const exercise = state.exercises.find((e) => e.id === exerciseId);
            if (!exercise) return false;

            set((state) => ({
                exercises: state.exercises.filter((e) => e.id !== exerciseId),
                logs: state.logs.filter((l) => l.exerciseId !== exerciseId),
            }));
            return true;
        },

        // Session actions
        createSession: (data) => {
            const id = generateSessionId();
            const newSession: WorkoutSession = { ...data, id };
            set((state) => ({ sessions: [...state.sessions, newSession] }));
            return newSession;
        },

        updateSession: (id, data) => {
            const state = get();
            const session = state.sessions.find((s) => s.id === id);
            if (!session) return null;
            const updated = { ...session, ...data };
            set((state) => ({ sessions: state.sessions.map((s) => (s.id === id ? updated : s)) }));
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
            const newLog: ExerciseLog = { ...data, id };
            set((state) => ({ logs: [...state.logs, newLog] }));

            // Update perfect day status
            const session = get().sessions.find((s) => s.id === data.sessionId);
            if (session) {
                get().updateSessionPerfectDay(session.id);
            }

            return newLog;
        },

        updateLog: (id, data) => {
            const state = get();
            const log = state.logs.find((l) => l.id === id);
            if (!log) return null;
            const updated = { ...log, ...data };
            set((state) => ({ logs: state.logs.map((l) => (l.id === id ? updated : l)) }));

            // Update perfect day status
            get().updateSessionPerfectDay(log.sessionId);

            return updated;
        },

        deleteLog: (logId) => {
            const state = get();
            const log = state.logs.find((l) => l.id === logId);
            if (!log) return false;

            set((state) => ({ logs: state.logs.filter((l) => l.id !== logId) }));

            // Update perfect day status
            get().updateSessionPerfectDay(log.sessionId);

            return true;
        },

        // Helper to update session perfect day
        updateSessionPerfectDay: (sessionId) => {
            const state = get();
            const session = state.sessions.find((s) => s.id === sessionId);
            if (!session) return;

            // Get all logs for this session
            const sessionLogs = state.logs.filter((l) => l.sessionId === sessionId);

            // Get the exercise that was just logged
            if (sessionLogs.length === 0) {
                get().updateSession(sessionId, { perfectDay: false });
                return;
            }

            const lastExerciseId = sessionLogs[sessionLogs.length - 1].exerciseId;
            const exercise = state.exercises.find((e) => e.id === lastExerciseId);
            if (!exercise) return;

            // Get the workout day
            const workoutDay = state.workoutDays.find((d) => d.id === exercise.workoutDayId);
            if (!workoutDay) return;

            // Get all exercises for this workout day
            const dayExercises = state.exercises.filter((e) => e.workoutDayId === workoutDay.id);

            // Check if all exercises have enough completed sets
            const isPerfect = dayExercises.every((dayExercise) => {
                const targetSets = dayExercise.sets ?? 1;
                const completedSets = sessionLogs.filter((l) => l.exerciseId === dayExercise.id).length;
                return completedSets >= targetSets;
            });

            get().updateSession(sessionId, { perfectDay: isPerfect });
        },

        // Query helpers
        getUserWithRelations: (userId) => {
            const state = get();
            const user = state.users.find((u) => u.id === userId);
            if (!user) return null;

            const userPlans = state.plans.filter((p) => p.userId === userId);
            const userSessions = state.sessions.filter((s) => s.userId === userId);

            const plansWithDays = userPlans.map((plan) => {
                const planDays = state.workoutDays.filter((d) => d.planId === plan.id);

                const daysWithExercises = planDays.map((day) => {
                    const dayExercises = state.exercises.filter((e) => e.workoutDayId === day.id);

                    const exercisesWithLogs = dayExercises.map((exercise) => ({
                        ...exercise,
                        logs: state.logs.filter((l) => l.exerciseId === exercise.id),
                    }));

                    return { ...day, exercises: exercisesWithLogs };
                });

                return { ...plan, days: daysWithExercises };
            });

            const sessionsWithLogs = userSessions.map((session) => {
                const sessionLogs = state.logs.filter((l) => l.sessionId === session.id);

                const logsWithExercise = sessionLogs.map((log) => {
                    const exercise = state.exercises.find((e) => e.id === log.exerciseId);
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
            const plan = state.plans.find((p) => p.id === planId);
            if (!plan) return null;

            const planDays = state.workoutDays.filter((d) => d.planId === plan.id);
            const daysWithExercises = planDays.map((day) => {
                const dayExercises = state.exercises.filter((e) => e.workoutDayId === day.id);
                const exercisesWithLogs = dayExercises.map((exercise) => ({
                    ...exercise,
                    logs: state.logs.filter((l) => l.exerciseId === exercise.id),
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
            const initial = getInitialState();
            set(initial);
        },
    };
});
