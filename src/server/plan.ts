import { getDb } from "@/db/client";
import * as schema from "@/db/sqlite";
import { randomUUID } from "expo-crypto";
import { and, eq, inArray } from "drizzle-orm";
import { enqueueWrite } from "@/db/write-queue";

export interface ExerciseInput {
    name: string;
    workoutDays: Weekday[];
    unit?: Unit | null;
    usesWeight?: boolean;
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

interface DesiredExerciseRecord {
    dayName: Weekday;
    name: string;
    unit: Unit | null;
    sets: number | null;
    reps: number | null;
    weight: number | null;
    distance: number | null;
    duration: number | null;
    type: ExerciseType;
    variant: ExerciseVariant;
}

function buildDesiredExercises(data: SavePlanInput): DesiredExerciseRecord[] {
    const selectedDays = new Set(data.workoutDays);

    return (data.exercises ?? [])
        .flatMap((exercise) =>
            (exercise.workoutDays ?? [])
                .filter((dayName): dayName is Weekday => selectedDays.has(dayName))
                .map((dayName) => ({
                    dayName,
                    name: exercise.name.trim(),
                    unit: exercise.unit ?? null,
                    sets: exercise.sets ?? null,
                    reps: exercise.reps ?? null,
                    weight: exercise.weight ?? null,
                    distance: exercise.distance ?? null,
                    duration: exercise.duration ?? null,
                    type: exercise.type,
                    variant: exercise.variant,
                })),
        )
        .filter((exercise) => exercise.name.length > 0);
}

function getExerciseMatchKey(name: string, workoutDayId: string, type: ExerciseType, variant: ExerciseVariant) {
    return `${workoutDayId}::${name.trim().toLowerCase()}::${type}::${variant}`;
}

export async function saveWorkoutPlan(data: SavePlanInput) {
    const userId = data.userId;
    const database = getDb();
    const desiredExercises = buildDesiredExercises(data);

    try {
        return await enqueueWrite(() =>
            database.transaction(async (tx) => {
                let planId = data.planId;

                if (!planId) {
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
                    const currentPlanId = planId;

                    const insertedDays = await tx
                        .insert(schema.workoutDays)
                        .values(
                            data.workoutDays.map((dayName) => ({
                                localId: randomUUID(),
                                userId,
                                planId: currentPlanId,
                                dayName,
                                isDeleted: false,
                            })),
                        )
                        .returning({ localId: schema.workoutDays.localId, dayName: schema.workoutDays.dayName });

                    if (desiredExercises.length > 0) {
                        const workoutDayIdByName = new Map(insertedDays.map((day) => [day.dayName, day.localId]));
                        const exerciseInserts = desiredExercises
                            .map((exercise) => {
                                const workoutDayId = workoutDayIdByName.get(exercise.dayName);
                                if (!workoutDayId) return null;

                                return {
                                    localId: randomUUID(),
                                    userId,
                                    planId: currentPlanId,
                                    workoutDayId,
                                    name: exercise.name,
                                    sets: exercise.sets,
                                    reps: exercise.reps,
                                    weight: exercise.weight,
                                    distance: exercise.distance,
                                    duration: exercise.duration,
                                    unit: exercise.unit ?? null,
                                    type: exercise.type,
                                    variant: exercise.variant,
                                    isDeleted: false,
                                };
                            })
                            .filter((exercise): exercise is NonNullable<typeof exercise> => exercise !== null);

                        if (exerciseInserts.length > 0) {
                            await tx.insert(schema.exercises).values(exerciseInserts);
                        }
                    }

                    return { success: true as const, planId };
                }

                const currentPlanId = planId;

                const [existingPlan] = await tx
                    .select({ localId: schema.workoutPlans.localId })
                    .from(schema.workoutPlans)
                    .where(and(eq(schema.workoutPlans.localId, currentPlanId), eq(schema.workoutPlans.userId, userId)))
                    .limit(1);

                if (!existingPlan) throw new Error("Plan not found");

                await tx
                    .update(schema.workoutPlans)
                    .set({
                        split: data.split,
                        workoutDaysPerWeek: data.workoutDays.length,
                        goal: data.goal ?? null,
                        fitnessLevel: data.fitnessLevel ?? null,
                        isDeleted: false,
                    })
                    .where(eq(schema.workoutPlans.localId, currentPlanId));

                const existingDays = await tx
                    .select({
                        localId: schema.workoutDays.localId,
                        dayName: schema.workoutDays.dayName,
                        isDeleted: schema.workoutDays.isDeleted,
                    })
                    .from(schema.workoutDays)
                    .where(eq(schema.workoutDays.planId, currentPlanId));

                const existingExercises = await tx
                    .select({
                        localId: schema.exercises.localId,
                        workoutDayId: schema.exercises.workoutDayId,
                        name: schema.exercises.name,
                        sets: schema.exercises.sets,
                        reps: schema.exercises.reps,
                        weight: schema.exercises.weight,
                        distance: schema.exercises.distance,
                        duration: schema.exercises.duration,
                        unit: schema.exercises.unit,
                        type: schema.exercises.type,
                        variant: schema.exercises.variant,
                        isDeleted: schema.exercises.isDeleted,
                    })
                    .from(schema.exercises)
                    .where(eq(schema.exercises.planId, currentPlanId));

                const desiredDayNames = new Set(data.workoutDays);
                const workoutDayIdByName = new Map<Weekday, string>();
                const dayIdsToRestore: string[] = [];
                const dayIdsToSoftDelete: string[] = [];

                for (const existingDay of existingDays) {
                    if (desiredDayNames.has(existingDay.dayName)) {
                        workoutDayIdByName.set(existingDay.dayName, existingDay.localId);
                        if (existingDay.isDeleted) dayIdsToRestore.push(existingDay.localId);
                    } else if (!existingDay.isDeleted) {
                        dayIdsToSoftDelete.push(existingDay.localId);
                    }
                }

                const newDays = data.workoutDays
                    .filter((dayName) => !workoutDayIdByName.has(dayName))
                    .map((dayName) => ({
                        localId: randomUUID(),
                        userId,
                        planId: currentPlanId,
                        dayName,
                        isDeleted: false,
                    }));

                if (newDays.length > 0) {
                    const insertedDays = await tx
                        .insert(schema.workoutDays)
                        .values(newDays)
                        .returning({ localId: schema.workoutDays.localId, dayName: schema.workoutDays.dayName });

                    for (const insertedDay of insertedDays) {
                        workoutDayIdByName.set(insertedDay.dayName, insertedDay.localId);
                    }
                }

                if (dayIdsToRestore.length > 0) {
                    await tx.update(schema.workoutDays).set({ isDeleted: false }).where(inArray(schema.workoutDays.localId, dayIdsToRestore));
                }

                if (dayIdsToSoftDelete.length > 0) {
                    await tx.update(schema.workoutDays).set({ isDeleted: true }).where(inArray(schema.workoutDays.localId, dayIdsToSoftDelete));
                }

                const existingExercisesByKey = new Map<string, typeof existingExercises>();
                for (const exercise of existingExercises) {
                    const key = getExerciseMatchKey(exercise.name, exercise.workoutDayId, exercise.type, exercise.variant);
                    const bucket = existingExercisesByKey.get(key);
                    if (bucket) bucket.push(exercise);
                    else existingExercisesByKey.set(key, [exercise]);
                }

                for (const matches of existingExercisesByKey.values()) {
                    matches.sort((left, right) => Number(left.isDeleted) - Number(right.isDeleted));
                }

                const matchedExerciseIds = new Set<string>();
                const exerciseInserts: (typeof schema.exercises.$inferInsert)[] = [];

                for (const desiredExercise of desiredExercises) {
                    const workoutDayId = workoutDayIdByName.get(desiredExercise.dayName);
                    if (!workoutDayId) continue;

                    const key = getExerciseMatchKey(desiredExercise.name, workoutDayId, desiredExercise.type, desiredExercise.variant);
                    const existingMatches = existingExercisesByKey.get(key) ?? [];
                    const existingExercise = existingMatches.shift();

                    if (existingExercise) {
                        matchedExerciseIds.add(existingExercise.localId);

                        await tx
                            .update(schema.exercises)
                            .set({
                                workoutDayId,
                                name: desiredExercise.name,
                                sets: desiredExercise.sets,
                                reps: desiredExercise.reps,
                                weight: desiredExercise.weight,
                                distance: desiredExercise.distance,
                                duration: desiredExercise.duration,
                                unit: desiredExercise.unit ?? null,
                                type: desiredExercise.type,
                                variant: desiredExercise.variant,
                                isDeleted: false,
                            })
                            .where(eq(schema.exercises.localId, existingExercise.localId));
                    } else {
                        exerciseInserts.push({
                            localId: randomUUID(),
                            userId,
                            planId: currentPlanId,
                            workoutDayId,
                            name: desiredExercise.name,
                            sets: desiredExercise.sets,
                            reps: desiredExercise.reps,
                            weight: desiredExercise.weight,
                            distance: desiredExercise.distance,
                            duration: desiredExercise.duration,
                            unit: desiredExercise.unit ?? null,
                            type: desiredExercise.type,
                            variant: desiredExercise.variant,
                            isDeleted: false,
                        });
                    }
                }

                if (exerciseInserts.length > 0) {
                    await tx.insert(schema.exercises).values(exerciseInserts);
                }

                const exerciseIdsToSoftDelete = existingExercises
                    .filter((exercise) => !matchedExerciseIds.has(exercise.localId) && !exercise.isDeleted)
                    .map((exercise) => exercise.localId);

                if (exerciseIdsToSoftDelete.length > 0) {
                    await tx.update(schema.exercises).set({ isDeleted: true }).where(inArray(schema.exercises.localId, exerciseIdsToSoftDelete));
                }

                return { success: true as const, planId };
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
