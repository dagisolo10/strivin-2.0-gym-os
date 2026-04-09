import { getDb } from "@/db/client";
import * as schema from "@/db/sqlite";
import { randomUUID } from "expo-crypto";
import { and, eq, inArray } from "drizzle-orm";
import { enqueueWrite } from "@/db/write-queue";
import { getDateKey, getWeekdayName, sortWorkoutDays } from "@/lib/helper-functions";
import { ExerciseLog, WorkoutPlanWithDays, WorkoutSessionWithExerciseLogs } from "@/types/types";

export function calculateSuggestedLoad(targetWeight?: number | null, averageWeight?: number | null, averageReps?: number | null, targetReps?: number | null) {
    if (!targetWeight || !targetReps || !averageReps) return null;
    if (averageReps >= targetReps) return Math.round(targetWeight * 1.03);
    if (averageReps < targetReps * 0.7) return Math.max(1, Math.round(targetWeight * 0.97));
    return Math.round(targetWeight);
}

interface LogData {
    userId: string;
    exerciseId: string;
    reps?: number | null;
    weight?: number | null;
    duration?: number | null;
    distance?: number | null;
    todaysLogs: ExerciseLog[];
    activePlan: WorkoutPlanWithDays;
}

export async function logExerciseSet(data: LogData) {
    const db = getDb();
    const dateKey = getDateKey();
    const { userId, exerciseId, reps, weight, duration, distance } = data;

    try {
        await enqueueWrite(() =>
            db.transaction(async (tx) => {
                let session = await tx.query.workoutSessions.findFirst({
                    where: (fields, { and, eq }) => and(eq(fields.userId, userId), eq(fields.date, dateKey)),
                });

                let sessionId = session?.localId;

                if (!sessionId) {
                    const newId = randomUUID();
                    await tx.insert(schema.workoutSessions).values({
                        localId: newId,
                        userId,
                        date: dateKey,
                        sessionLength: null,
                        perfectDay: false,
                        syncStatus: "pending",
                        isDeleted: false,
                    });

                    sessionId = newId;
                    session = { localId: newId, userId, date: dateKey } as any;
                }

                await tx.insert(schema.exerciseLogs).values({
                    userId,
                    sessionId,
                    exerciseId,
                    reps: reps ?? null,
                    weight: weight ?? null,
                    duration: duration ?? null,
                    distance: distance ?? null,
                    completed: true,
                });

                const sessionWithLogs = { ...session, logs: [...data.todaysLogs, { exerciseId }] } as WorkoutSessionWithExerciseLogs;

                const perfectDay = computePerfectDay(data.activePlan, sessionWithLogs);

                await tx.update(schema.workoutSessions).set({ perfectDay }).where(eq(schema.workoutSessions.localId, sessionId));

                if (perfectDay) await updateStreak(db, data.activePlan);
            }),
        );
    } catch (error) {
        console.error("[logExerciseSet] Error:", error);
        if (error instanceof Error) throw new Error(`Logging failed: ${error.message}`);
        else throw new Error("An unexpected error occurred while saving your set.");
    }
}

async function updateStreak(db: DB, activePlan: WorkoutPlanWithDays) {
    await db.transaction(async (tx) => {
        const todayKey = getDateKey();
        const planDays = sortWorkoutDays(activePlan.days.map((day) => day.dayName));

        const prevWeekDay = getPreviousWorkoutDay(planDays);

        if (!prevWeekDay) return;

        const prevSessionDate = getPreviousDateForWeekday(prevWeekDay);

        const [user] = await tx
            .select({
                currentStreak: schema.users.currentStreak,
                longestStreak: schema.users.longestStreak,
                lastStreakAwardedAt: schema.users.lastStreakAwardedAt,
            })
            .from(schema.users)
            .where(eq(schema.users.localId, activePlan.userId))
            .limit(1);

        if (!user) return;
        if (user.lastStreakAwardedAt === todayKey) return;

        const [lastPerfectSession] = await tx
            .select()
            .from(schema.workoutSessions)
            .where(
                and(
                    eq(schema.workoutSessions.userId, activePlan.userId),
                    eq(schema.workoutSessions.date, prevSessionDate),
                    eq(schema.workoutSessions.perfectDay, true),
                ),
            )
            .limit(1);

        if (!lastPerfectSession) {
            await tx
                .update(schema.users)
                .set({
                    currentStreak: 1,
                    longestStreak: Math.max(1, user.longestStreak ?? 0),
                    lastStreakAwardedAt: todayKey,
                })
                .where(eq(schema.users.localId, activePlan.userId));

            return;
        }

        const newStreak = (user.currentStreak ?? 0) + 1;

        await tx
            .update(schema.users)
            .set({
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, user.longestStreak ?? 0),
                lastStreakAwardedAt: todayKey,
            })
            .where(eq(schema.users.localId, activePlan.userId));
    });
}

function getPreviousDateForWeekday(prevWeekDay: Weekday): string {
    const today = new Date();
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const todayIndex = today.getDay();
    const targetIndex = weekdays.indexOf(prevWeekDay);
    let diff = todayIndex - targetIndex;

    if (diff <= 0) diff += 7;

    const result = new Date();
    result.setDate(today.getDate() - diff);

    return getDateKey(result);
}

function getPreviousWorkoutDay(planDays: Weekday[]) {
    const index = planDays.indexOf(getWeekdayName());

    return index === -1 ? null : index === 0 ? planDays[planDays.length - 1] : planDays[index - 1];
}

export function computePerfectDay(activePlan: WorkoutPlanWithDays | null, todaysSession: WorkoutSessionWithExerciseLogs) {
    if (!activePlan || !todaysSession) return false;

    const workoutDay = activePlan.days.find((day) => day.dayName === getWeekdayName());
    if (!workoutDay) return false;

    const todaysExercises = workoutDay.exercises;

    if (todaysExercises.length === 0) return false;

    const logsByExerciseId = new Map<string, number>();
    for (const log of todaysSession.logs) {
        const currentCount = logsByExerciseId.get(log.exerciseId) ?? 0;
        logsByExerciseId.set(log.exerciseId, currentCount + 1);
    }

    for (const exercise of todaysExercises) {
        const requiredSets = exercise.sets ?? 1;
        const completedSets = logsByExerciseId.get(exercise.localId) ?? 0;

        if (completedSets < requiredSets) {
            return false;
        }
    }

    return true;
}

export async function resetLocalUserData() {
    const database = getDb();

    await enqueueWrite(() =>
        database.transaction(async (tx) => {
            const [user] = await tx.select().from(schema.users).limit(1);
            if (!user) return;

            const userId = user.localId;
            const plans = await tx.select().from(schema.workoutPlans).where(eq(schema.workoutPlans.userId, userId));
            const planIds = plans.map((plan) => plan.localId);

            if (planIds.length > 0) {
                const workoutDays = await tx.select().from(schema.workoutDays).where(inArray(schema.workoutDays.planId, planIds));
                const dayIds = workoutDays.map((day) => day.localId);

                if (dayIds.length > 0) {
                    await tx.delete(schema.exercises).where(inArray(schema.exercises.workoutDayId, dayIds));
                }

                await tx.delete(schema.workoutDays).where(inArray(schema.workoutDays.planId, planIds));
            }

            await tx.delete(schema.exerciseLogs).where(eq(schema.exerciseLogs.userId, userId));
            await tx.delete(schema.workoutSessions).where(eq(schema.workoutSessions.userId, userId));
            await tx.delete(schema.workoutPlans).where(eq(schema.workoutPlans.userId, userId));
            await tx.delete(schema.users).where(eq(schema.users.localId, userId));
        }),
    );
}

export async function getRecentLogsForExercise(userId: string, exerciseId: string) {
    const database = getDb();
    const logs = await database
        .select()
        .from(schema.exerciseLogs)
        .where(and(eq(schema.exerciseLogs.userId, userId), eq(schema.exerciseLogs.exerciseId, exerciseId)))
        .orderBy(schema.exerciseLogs.createdAt)
        .limit(6);
    return logs;
}

export async function getUser(userId: string) {
    const database = getDb()!;

    const [user] = await database.select().from(schema.users).where(eq(schema.users.localId, userId)).limit(1);
    if (!user) return null;

    const plans = await database.select().from(schema.workoutPlans).where(eq(schema.workoutPlans.userId, userId));

    const sessions = await database.select().from(schema.workoutSessions).where(eq(schema.workoutSessions.userId, userId));

    const plansWithDays = await Promise.all(
        plans.map(async (plan: { localId: string }) => {
            const days = await database.select().from(schema.workoutDays).where(eq(schema.workoutDays.planId, plan.localId));

            const daysWithExercises = await Promise.all(
                days.map(async (day: { localId: string }) => {
                    const exercises = await database.select().from(schema.exercises).where(eq(schema.exercises.workoutDayId, day.localId));

                    const exercisesWithLogs = await Promise.all(
                        exercises.map(async (exercise: { localId: string }) => {
                            const logs = await database.select().from(schema.exerciseLogs).where(eq(schema.exerciseLogs.exerciseId, exercise.localId));
                            return { ...exercise, logs };
                        }),
                    );

                    return { ...day, exercises: exercisesWithLogs };
                }),
            );

            return { ...plan, days: daysWithExercises };
        }),
    );

    const sessionsWithLogs = await Promise.all(
        sessions.map(async (session: { localId: string }) => {
            const logs = await database.select().from(schema.exerciseLogs).where(eq(schema.exerciseLogs.sessionId, session.localId));

            const logsWithExercise = await Promise.all(
                logs.map(async (log: { exerciseId: string }) => {
                    const [exercise] = await database.select().from(schema.exercises).where(eq(schema.exercises.localId, log.exerciseId)).limit(1);
                    return {
                        ...log,
                        exercise: exercise || ({} as any),
                    };
                }),
            );

            return { ...session, logs: logsWithExercise };
        }),
    );

    return { ...user, plans: plansWithDays, sessions: sessionsWithLogs };
}
