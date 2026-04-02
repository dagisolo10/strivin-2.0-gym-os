import { z } from "zod";

const exerciseSchema = z.object({
    name: z.string().min(1, "Exercise name required"),
    workoutDays: z.array(z.string()).min(1, "Pick at least one day"),
    unit: z.string().min(1, "Must choose unit"),

    sets: z.number().min(1, "Must have at least 1 set").optional(),
    reps: z.number().min(1, "Must have at least 1 rep").optional(),

    distance: z.number().min(1, "Must have at least 1 distance").optional(),
    duration: z.number().min(1, "Must have at least 1 duration").optional(),

    weight: z.number().min(0.1, "Weight must be at least 0.1").optional(),

    type: z.string().min(1, "Exercise type required"),
    variant: z.string().min(1, "Exercise variant required"),
});

export const onboardingSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    split: z.string().min(1, "What's your split called?"),
    workoutDays: z.array(z.string()).min(1, "Pick at least one day"),
    exercises: z.array(exerciseSchema).optional(),
    goal: z.string().optional(),
    profile: z.string().optional(),
});
