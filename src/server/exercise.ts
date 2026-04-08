import { getDb } from "@/db/client";
import { enqueueWrite } from "@/db/write-queue";
import { and, eq } from "drizzle-orm";
import * as schema from "@/db/sqlite";
import { randomUUID } from "expo-crypto";

interface NewExercise {
    name: string;
    unit: Unit;
    sets?: number;
    reps?: number;
    weight?: number;
    distance?: number;
    duration?: number;
    type: ExerciseType;
    variant: ExerciseVariant;
}

interface Data {
    userId: string;
    planId: string;
    exercise: NewExercise;
    workoutDays: Weekday[];
}

export async function addExercise(data: Data) {
    try {
        const database = getDb();

        await enqueueWrite(() =>
            database.transaction(async (tx) => {
                const [plan] = await tx.select().from(schema.workoutPlans).where(and(eq(schema.workoutPlans.localId, data.planId), eq(schema.workoutPlans.userId, data.userId))).limit(1);

                if (!plan) throw new Error("Plan not found");

                for (const day of data.workoutDays) {
                    const [existingWorkoutDay] = await tx.select().from(schema.workoutDays).where(and(eq(schema.workoutDays.planId, data.planId), eq(schema.workoutDays.dayName, day))).limit(1);
                    let workoutDay = existingWorkoutDay;

                    if (!workoutDay) {
                        const dayId = randomUUID();
                        await tx.insert(schema.workoutDays).values({
                            localId: dayId,
                            userId: data.userId,
                            planId: data.planId,
                            dayName: day,
                        });
                        workoutDay = { localId: dayId, dayName: day, userId: data.userId, planId: data.planId } as typeof workoutDay;
                    }

                    await tx.insert(schema.exercises).values({
                        localId: randomUUID(),
                        userId: data.userId,
                        planId: data.planId,
                        workoutDayId: workoutDay.localId,
                        name: data.exercise.name,
                        sets: data.exercise.sets ?? null,
                        reps: data.exercise.reps ?? null,
                        weight: data.exercise.weight ?? null,
                        distance: data.exercise.distance ?? null,
                        duration: data.exercise.duration ?? null,
                        unit: data.exercise.unit,
                        type: data.exercise.type,
                        variant: data.exercise.variant,
                    });
                }
            }),
        );

        return { success: true };
    } catch (error) {
        console.error("Error in addExercise", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
