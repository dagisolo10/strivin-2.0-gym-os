import { z } from "zod";

export const exerciseSchema = z
    .object({
        name: z.string().min(1, "Exercise name required"),
        workoutDays: z.array(z.string()).min(1, "Pick at least one day"),
        unit: z.string().optional(),
        type: z.string().min(1, "Exercise type required"),
        variant: z.string().min(1, "Exercise variant required"),
        usesWeight: z.boolean().optional().default(true),

        sets: z.number().optional(),
        reps: z.number().optional(),
        weight: z.number().optional(),

        distance: z.number().optional(),
        duration: z.number().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.type === "Cardio") {
            if (!data.duration || data.duration < 1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Duration is required for Cardio", path: ["duration"] });
            if (data.distance === undefined || data.distance === null || data.distance < 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Distance is required for Cardio", path: ["distance"] });
            if (!data.unit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must choose unit", path: ["unit"] });
        } else {
            if (!data.sets || data.sets < 1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sets are required for strength training", path: ["sets"] });
            if (!data.reps || data.reps < 1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reps are required", path: ["reps"] });

            const isBodyweight = !data.usesWeight || (data.type === "Core" && !data.usesWeight);
            if (isBodyweight) return;

            if (!data.unit) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must choose unit", path: ["unit"] });
            if (!data.weight || data.weight < 1) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Weight is required", path: ["weight"] });
            }
        }
    });

export const onboardingSchema = z.object({
    name: z.string().trim().min(2, "Name is too short"),
    split: z.string().trim().min(1, "What's your split called?"),
    workoutDays: z.array(z.string()).min(1, "Pick at least one day"),
    exercises: z.array(exerciseSchema).optional(),
    goal: z.string().optional(),
    sessionLength: z.number().min(15, "Session length should be at least 15 minutes").max(180, "Keep session length under 180 minutes").optional(),
    fitnessLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    profile: z.string().optional(),
});


export const planEditorSchema = z.object({
    split: z.string().trim().min(1, "Split name is required"),
    workoutDays: z.array(z.string()).min(1, "Choose at least one workout day"),
    goal: z.string().optional(),
    sessionLength: z.number().min(15).max(180).optional(),
    fitnessLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
});