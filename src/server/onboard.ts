import { db } from "@/db/client";
import * as schema from "@/db/sqlite";
import { Goal, WorkoutSplit, Exercise } from "@/types/interface";

interface OnboardingState {
    name: string;
    split: WorkoutSplit;
    workoutDays: string[];
    exercises: Exercise[];
    goal: Goal;
    profile: string | null;
}

export async function registerUser(data: OnboardingState) {
    const [user] = await db
        .insert(schema.users)
        .values({
            name: data.name,
            profile: data.profile,
        })
        .returning({ id: schema.users.id });

    const [plan] = await db
        .insert(schema.workoutPlans)
        .values({
            userId: user.id,
            split: data.split,
            workoutDaysPerWeek: data.workoutDays.length,
            goal: data.goal,
        })
        .returning({ id: schema.workoutPlans.id });

    const dayRecords = await db
        .insert(schema.workoutDays)
        .values(
            data.workoutDays.map((day) => ({
                planId: plan.id,
                dayName: day,
            })),
        )
        .returning({ id: schema.workoutDays.id });

    if (data.exercises && data.exercises.length > 0 && dayRecords.length > 0) {
        const firstDayId = dayRecords[0].id;

        const exerciseData = data.exercises.map((exercise) => ({
            workoutDayId: firstDayId,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            distance: exercise.distance,
            duration: exercise.duration,
            unit: exercise.unit,
            type: exercise.type,
            variant: exercise.variant,
        }));

        await db.insert(schema.exercises).values(exerciseData);
    }

    return { success: true, userId: user.id };
}
