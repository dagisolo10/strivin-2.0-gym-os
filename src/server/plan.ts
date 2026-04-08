import { getDb } from "@/db/client";
import * as schema from "@/db/sqlite";
import { randomUUID } from "expo-crypto";
import { and, eq, inArray } from "drizzle-orm";
import { enqueueWrite } from "@/db/write-queue";

export interface ExerciseInput {
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

interface SavePlanInput {
    userId: string;
    planId?: string;
    split: WorkoutSplit;
    workoutDays: Weekday[];
    exercises?: ExerciseInput[];
    goal?: Goal | null;
    sessionLength?: number;
    fitnessLevel?: FitnessLevel | null;
}

export async function saveWorkoutPlan(data: SavePlanInput) {
    const userId = data.userId;
    const database = getDb();

    try {
        return await enqueueWrite(() =>
            database.transaction(async (tx) => {
                let planId = data.planId;

                // rewrite
                if (planId) {
                    const [existingPlan] = await tx
                        .select()
                        .from(schema.workoutPlans)
                        .where(and(eq(schema.workoutPlans.localId, planId), eq(schema.workoutPlans.userId, userId)))
                        .limit(1);

                    if (!existingPlan) throw new Error("Plan not found");

                    await tx
                        .update(schema.workoutPlans)
                        .set({
                            split: data.split,
                            workoutDaysPerWeek: data.workoutDays.length,
                            goal: data.goal ?? null,
                            fitnessLevel: data.fitnessLevel ?? null,
                        })
                        .where(eq(schema.workoutPlans.localId, planId));

                    const existingDays = await tx.select().from(schema.workoutDays).where(eq(schema.workoutDays.planId, planId));
                    const dayIds = existingDays.map((day) => day.localId);

                    if (dayIds.length > 0) {
                        await tx.delete(schema.exercises).where(inArray(schema.exercises.workoutDayId, dayIds));
                    }

                    await tx.delete(schema.workoutDays).where(eq(schema.workoutDays.planId, planId));
                }
                // creation
                else {
                    const newPlanId = randomUUID();
                    await tx.insert(schema.workoutPlans).values({
                        localId: newPlanId,
                        userId,
                        split: data.split,
                        workoutDaysPerWeek: data.workoutDays.length,
                        goal: data.goal ?? null,
                        fitnessLevel: data.fitnessLevel ?? null,
                    });
                    planId = newPlanId;
                }

                const dayRecords = await Promise.all(
                    data.workoutDays.map(async (day) => {
                        const dayId = randomUUID();
                        await tx.insert(schema.workoutDays).values({
                            localId: dayId,
                            userId,
                            planId: planId!,
                            dayName: day,
                        });
                        return { localId: dayId, dayName: day };
                    }),
                );

                if (data.exercises && data.exercises.length > 0) {
                    const exerciseData = data.exercises
                        .flatMap((exercise) =>
                            (exercise.workoutDays || []).map((selectedDayName: Weekday) => {
                                const dayRecord = dayRecords.find((day) => day.dayName === selectedDayName);
                                if (!dayRecord) return null;

                                return {
                                    userId,
                                    planId: planId!,
                                    workoutDayId: dayRecord.localId,
                                    name: exercise.name,
                                    sets: exercise.sets ?? null,
                                    reps: exercise.reps ?? null,
                                    weight: exercise.weight ?? null,
                                    distance: exercise.distance ?? null,
                                    duration: exercise.duration ?? null,
                                    unit: exercise.unit,
                                    type: exercise.type,
                                    variant: exercise.variant,
                                };
                            }),
                        )
                        .filter((exercise): exercise is NonNullable<typeof exercise> => exercise !== null);

                    if (exerciseData.length) {
                        await tx.insert(schema.exercises).values(exerciseData);
                    }
                }

                return { success: true as const, planId: planId! };
            }),
        );
    } catch (error) {
        console.error("saveWorkoutPlan error", error);
        return { success: false as const, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deleteWorkoutPlan(userId: string, planId: string) {
    const database = getDb();
    try {
        return await enqueueWrite(() =>
            database.transaction(async (tx) => {
                const [plan] = await tx
                    .select()
                    .from(schema.workoutPlans)
                    .where(and(eq(schema.workoutPlans.localId, planId), eq(schema.workoutPlans.userId, userId)))
                    .limit(1);

                if (!plan) throw new Error("Plan not found");

                const workoutDays = await tx.select().from(schema.workoutDays).where(eq(schema.workoutDays.planId, planId));
                const dayIds = workoutDays.map((day) => day.localId);

                if (dayIds.length > 0) {
                    await tx.delete(schema.exercises).where(inArray(schema.exercises.workoutDayId, dayIds));
                }

                await tx.delete(schema.workoutDays).where(eq(schema.workoutDays.planId, planId));
                await tx.delete(schema.workoutPlans).where(eq(schema.workoutPlans.localId, planId));

                return { success: true as const };
            }),
        );
    } catch (error) {
        console.error("deleteWorkoutPlan error", error);
        return { success: false as const, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
