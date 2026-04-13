import { getDb } from "@/db/client";
import * as schema from "@/db/sqlite";
import { randomUUID } from "expo-crypto";
import { and, eq, inArray } from "drizzle-orm";
import { enqueueWrite } from "@/db/high-order-fn";

interface DeleteExerciseData {
    exerciseId: string;
    userId: string;
}

interface NewExercise {
    name: string;
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

interface UpdateExerciseData {
    exerciseId: string;
    userId: string;
    exercise: Partial<NewExercise>;
}

interface UpdateExerciseGroupData {
    exerciseIds: string[];
    userId: string;
    planId: string;
    workoutDays: Weekday[];
    exercise: Partial<NewExercise>;
}

interface DeleteExerciseGroupData {
    exerciseIds: string[];
    userId: string;
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
                const [plan] = await tx
                    .select()
                    .from(schema.workoutPlans)
                    .where(and(eq(schema.workoutPlans.localId, data.planId), eq(schema.workoutPlans.userId, data.userId), eq(schema.workoutPlans.isDeleted, false)))
                    .limit(1);

                if (!plan) throw new Error("Plan not found");

                for (const day of data.workoutDays) {
                    const [existingWorkoutDay] = await tx
                        .select()
                        .from(schema.workoutDays)
                        .where(and(eq(schema.workoutDays.planId, data.planId), eq(schema.workoutDays.dayName, day), eq(schema.workoutDays.isDeleted, false)))
                        .limit(1);
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
                        unit: data.exercise.unit ?? null,
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

export async function deleteExercise(data: DeleteExerciseData) {
    try {
        const database = getDb();

        await enqueueWrite(() =>
            database.transaction(async (tx) => {
                const [exercise] = await tx
                    .select()
                    .from(schema.exercises)
                    .where(and(eq(schema.exercises.localId, data.exerciseId), eq(schema.exercises.userId, data.userId)))
                    .limit(1);

                if (!exercise) throw new Error("Exercise not found");

                await tx.update(schema.exercises).set({ isDeleted: true, updatedAt: new Date().toISOString(), syncStatus: "pending" }).where(eq(schema.exercises.localId, data.exerciseId));
            }),
        );

        return { success: true };
    } catch (error) {
        console.error("Error in deleteExercise", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deleteExerciseGroup(data: DeleteExerciseGroupData) {
    try {
        const database = getDb();
        const exerciseIds = [...new Set(data.exerciseIds)].filter(Boolean);

        if (!exerciseIds.length) throw new Error("No exercises selected");

        await enqueueWrite(() =>
            database.transaction(async (tx) => {
                const exercises = await tx
                    .select()
                    .from(schema.exercises)
                    .where(and(inArray(schema.exercises.localId, exerciseIds), eq(schema.exercises.userId, data.userId), eq(schema.exercises.isDeleted, false)));

                if (!exercises.length) throw new Error("Exercise group not found");

                await tx
                    .update(schema.exercises)
                    .set({ isDeleted: true, updatedAt: new Date().toISOString(), syncStatus: "pending" })
                    .where(
                        inArray(
                            schema.exercises.localId,
                            exercises.map((exercise) => exercise.localId),
                        ),
                    );
            }),
        );

        return { success: true };
    } catch (error) {
        console.error("Error in deleteExerciseGroup", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updateExercise(data: UpdateExerciseData) {
    try {
        const database = getDb();

        await enqueueWrite(() =>
            database.transaction(async (tx) => {
                const [exercise] = await tx
                    .select()
                    .from(schema.exercises)
                    .where(and(eq(schema.exercises.localId, data.exerciseId), eq(schema.exercises.userId, data.userId), eq(schema.exercises.isDeleted, false)))
                    .limit(1);

                if (!exercise) throw new Error("Exercise not found");

                const updateData: any = {
                    updatedAt: new Date().toISOString(),
                    syncStatus: "pending",
                };

                if ("name" in data.exercise) updateData.name = data.exercise.name;
                if ("sets" in data.exercise) updateData.sets = data.exercise.sets ?? null;
                if ("reps" in data.exercise) updateData.reps = data.exercise.reps ?? null;
                if ("weight" in data.exercise) updateData.weight = data.exercise.weight ?? null;
                if ("distance" in data.exercise) updateData.distance = data.exercise.distance ?? null;
                if ("duration" in data.exercise) updateData.duration = data.exercise.duration ?? null;
                if ("unit" in data.exercise) updateData.unit = data.exercise.unit ?? null;
                if ("type" in data.exercise) updateData.type = data.exercise.type;
                if ("variant" in data.exercise) updateData.variant = data.exercise.variant;

                await tx.update(schema.exercises).set(updateData).where(eq(schema.exercises.localId, data.exerciseId));
            }),
        );

        return { success: true };
    } catch (error) {
        console.error("Error in updateExercise", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function updateExerciseGroup(data: UpdateExerciseGroupData) {
    try {
        const database = getDb();
        const exerciseIds = [...new Set(data.exerciseIds)].filter(Boolean);
        const desiredDayNames = [...new Set(data.workoutDays)];

        if (!exerciseIds.length) throw new Error("No exercises selected");
        if (!desiredDayNames.length) throw new Error("Pick at least one workout day");

        await enqueueWrite(() =>
            database.transaction(async (tx) => {
                const exercises = await tx
                    .select()
                    .from(schema.exercises)
                    .where(and(inArray(schema.exercises.localId, exerciseIds), eq(schema.exercises.userId, data.userId), eq(schema.exercises.isDeleted, false)));

                if (!exercises.length) throw new Error("Exercise group not found");

                const [plan] = await tx
                    .select()
                    .from(schema.workoutPlans)
                    .where(and(eq(schema.workoutPlans.localId, data.planId), eq(schema.workoutPlans.userId, data.userId), eq(schema.workoutPlans.isDeleted, false)))
                    .limit(1);

                if (!plan) throw new Error("Plan not found");

                const workoutDays = await tx
                    .select()
                    .from(schema.workoutDays)
                    .where(and(eq(schema.workoutDays.planId, data.planId), eq(schema.workoutDays.isDeleted, false)));

                const workoutDayByName = new Map(workoutDays.map((day) => [day.dayName, day] as const));
                const workoutDayNameById = new Map(workoutDays.map((day) => [day.localId, day.dayName] as const));

                const sourceExercise = exercises[0];
                const existingByDayName = new Map<Weekday, typeof exercises>();

                for (const exercise of exercises) {
                    const dayName = workoutDayNameById.get(exercise.workoutDayId);
                    if (!dayName) continue;

                    const current = existingByDayName.get(dayName);
                    if (current) current.push(exercise);
                    else existingByDayName.set(dayName, [exercise]);
                }

                const updateData: Record<string, unknown> = {
                    updatedAt: new Date().toISOString(),
                    syncStatus: "pending",
                };

                if ("name" in data.exercise) updateData.name = data.exercise.name;
                if ("sets" in data.exercise) updateData.sets = data.exercise.sets ?? null;
                if ("reps" in data.exercise) updateData.reps = data.exercise.reps ?? null;
                if ("weight" in data.exercise) updateData.weight = data.exercise.weight ?? null;
                if ("distance" in data.exercise) updateData.distance = data.exercise.distance ?? null;
                if ("duration" in data.exercise) updateData.duration = data.exercise.duration ?? null;
                if ("unit" in data.exercise) updateData.unit = data.exercise.unit ?? null;
                if ("type" in data.exercise) updateData.type = data.exercise.type;
                if ("variant" in data.exercise) updateData.variant = data.exercise.variant;

                for (const dayName of desiredDayNames) {
                    let workoutDay = workoutDayByName.get(dayName);

                    if (!workoutDay) {
                        const dayId = randomUUID();
                        await tx.insert(schema.workoutDays).values({
                            localId: dayId,
                            userId: data.userId,
                            planId: data.planId,
                            dayName,
                        });

                        workoutDay = {
                            localId: dayId,
                            userId: data.userId,
                            planId: data.planId,
                            dayName,
                            isDeleted: false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            serverId: null,
                            syncStatus: "pending",
                        };

                        workoutDayByName.set(dayName, workoutDay);
                    }

                    const existingForDay = existingByDayName.get(dayName) ?? [];
                    const [exerciseToUpdate, ...duplicates] = existingForDay;

                    if (exerciseToUpdate) {
                        await tx.update(schema.exercises).set(updateData).where(eq(schema.exercises.localId, exerciseToUpdate.localId));

                        if (duplicates.length) {
                            await tx
                                .update(schema.exercises)
                                .set({ isDeleted: true, updatedAt: new Date().toISOString(), syncStatus: "pending" })
                                .where(
                                    inArray(
                                        schema.exercises.localId,
                                        duplicates.map((exercise) => exercise.localId),
                                    ),
                                );
                        }
                    } else {
                        await tx.insert(schema.exercises).values({
                            localId: randomUUID(),
                            userId: data.userId,
                            planId: data.planId,
                            workoutDayId: workoutDay.localId,
                            name: data.exercise.name ?? sourceExercise.name,
                            sets: "sets" in data.exercise ? (data.exercise.sets ?? null) : sourceExercise.sets,
                            reps: "reps" in data.exercise ? (data.exercise.reps ?? null) : sourceExercise.reps,
                            weight: "weight" in data.exercise ? (data.exercise.weight ?? null) : sourceExercise.weight,
                            distance: "distance" in data.exercise ? (data.exercise.distance ?? null) : sourceExercise.distance,
                            duration: "duration" in data.exercise ? (data.exercise.duration ?? null) : sourceExercise.duration,
                            unit: "unit" in data.exercise ? (data.exercise.unit ?? null) : sourceExercise.unit,
                            type: data.exercise.type ?? sourceExercise.type,
                            variant: data.exercise.variant ?? sourceExercise.variant,
                        });
                    }
                }

                const dayNamesToDelete = [...existingByDayName.keys()].filter((dayName) => !desiredDayNames.includes(dayName));
                const exerciseIdsToDelete = dayNamesToDelete.flatMap((dayName) => (existingByDayName.get(dayName) ?? []).map((exercise) => exercise.localId));

                if (exerciseIdsToDelete.length) {
                    await tx
                        .update(schema.exercises)
                        .set({ isDeleted: true, updatedAt: new Date().toISOString(), syncStatus: "pending" })
                        .where(inArray(schema.exercises.localId, exerciseIdsToDelete));
                }
            }),
        );

        return { success: true };
    } catch (error) {
        console.error("Error in updateExerciseGroup", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
