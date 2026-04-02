// --- PPL Split Templates ---
import { Exercise, WorkoutSplit } from "@/types/interface";

export const PUSH_DAY_TEMPLATE: Partial<Exercise>[] = [
    { name: "Bench Press", sets: 3, reps: 10, weight: 60, unit: "kg", type: "Push", variant: "Upper" },
    { name: "Overhead Press", sets: 3, reps: 12, weight: 40, unit: "kg", type: "Push", variant: "Upper" },
    { name: "Tricep Push downs", sets: 3, reps: 15, weight: 20, unit: "kg", type: "Push", variant: "Upper" },
];

export const PULL_DAY_TEMPLATE: Partial<Exercise>[] = [
    { name: "Lat Pull downs", sets: 3, reps: 10, weight: 50, unit: "kg", type: "Pull", variant: "Upper" },
    { name: "Bent Over Rows", sets: 3, reps: 12, weight: 40, unit: "kg", type: "Pull", variant: "Upper" },
    { name: "Bicep Curls", sets: 3, reps: 12, weight: 12, unit: "kg", type: "Pull", variant: "Upper" },
];

export const LEGS_DAY_TEMPLATE: Partial<Exercise>[] = [
    { name: "Squats", sets: 3, reps: 10, weight: 80, unit: "kg", type: "Legs", variant: "Lower" },
    { name: "Leg Extensions", sets: 3, reps: 15, weight: 40, unit: "kg", type: "Legs", variant: "Lower" },
    { name: "Calf Raises", sets: 4, reps: 20, weight: 50, unit: "kg", type: "Legs", variant: "Lower" },
];

// --- Upper/Lower Split Templates ---

export const UPPER_BODY_TEMPLATE: Partial<Exercise>[] = [
    { name: "Incline Dumbbell Press", sets: 3, reps: 10, weight: 24, unit: "kg", type: "Push", variant: "Upper" },
    { name: "Pull Ups", sets: 3, reps: 8, weight: 0, unit: "kg", type: "Pull", variant: "Upper" },
    { name: "Lateral Raises", sets: 3, reps: 15, weight: 8, unit: "kg", type: "Push", variant: "Upper" },
];

export const LOWER_BODY_TEMPLATE: Partial<Exercise>[] = [
    { name: "Dead lifts", sets: 3, reps: 5, weight: 100, unit: "kg", type: "Legs", variant: "Lower" },
    { name: "Leg Press", sets: 3, reps: 12, weight: 120, unit: "kg", type: "Legs", variant: "Lower" },
    { name: "Hanging Leg Raises", sets: 3, reps: 15, weight: 0, unit: "kg", type: "Core", variant: "Lower" },
];

// --- Endurance / Cardio Templates ---

export const ENDURANCE_TEMPLATE: Partial<Exercise>[] = [
    { name: "Steady State Run", distance: 5.0, duration: 1800, unit: "km", type: "Cardio", variant: "Endurance" },
    { name: "Cycling Intervals", distance: 10, duration: 2400, unit: "km", type: "Cardio", variant: "Endurance" },
    { name: "Rowing Machine", distance: 2, duration: 600, unit: "km", type: "Cardio", variant: "Endurance" },
];

export const FULL_BODY_TEMPLATE: Partial<Exercise>[] = [
    { name: "Squats", sets: 3, reps: 10, weight: 80, unit: "kg", type: "Legs", variant: "Lower" },
    { name: "Bench Press", sets: 3, reps: 10, weight: 60, unit: "kg", type: "Push", variant: "Upper" },
    { name: "Lat Pull downs", sets: 3, reps: 10, weight: 50, unit: "kg", type: "Pull", variant: "Upper" },
];

// --- Template Selector Helper ---

export const getTemplate = (split: WorkoutSplit): Partial<Exercise>[] => {
    if (split === "Endurance") return [...ENDURANCE_TEMPLATE];
    if (split === "Full Body") return [...FULL_BODY_TEMPLATE];
    if (split === "Upper Lower") return [...UPPER_BODY_TEMPLATE, ...LOWER_BODY_TEMPLATE];
    if (split === "Push Pull Leg") return [...PUSH_DAY_TEMPLATE, ...PULL_DAY_TEMPLATE, ...LEGS_DAY_TEMPLATE];
    return [];
};
