import { getDb } from "@/db/client";
import * as schema from "@/db/sqlite";
import { randomUUID } from "expo-crypto";
import { and, eq, inArray } from "drizzle-orm";
import { enqueueWrite } from "@/db/high-order-fn";
import { getDateKey, getWeekdayName, sortWorkoutDays } from "@/lib/helper-functions";
import { ExerciseLog, ExerciseWithLogs, ProgressionConfig, ProgressionSuggestion, SessionProgress, WorkoutPlanWithDays, WorkoutSessionWithExerciseLogs } from "@/types/types";

const DEFAULT_PROGRESSION_CONFIG: ProgressionConfig = {
    minimumSessions: 4,
    successRate: 0.8,
    maxHistorySessions: 6,
    repsIncrement: 1,
    weightIncrement: 2.5,
    setsIncrement: 1,
    distanceIncrement: 0.25,
    durationIncrement: 30,
};

const isCardioExercise = (exercise: ExerciseWithLogs) => exercise.type === "Cardio";

const roundToIncrement = (value: number, increment: number) => Math.round(value / increment) * increment;

const average = (values: (number | null | undefined)[]) => {
    const valid = values.filter((value): value is number => typeof value === "number" && !Number.isNaN(value));
    return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
};

export function calculateSuggestedLoad(targetWeight?: number | null, averageWeight?: number | null, averageReps?: number | null, targetReps?: number | null) {
    if (!targetWeight || !targetReps || !averageReps) return null;
    if (averageReps >= targetReps) return Math.round(targetWeight * 1.03);
    if (averageReps < targetReps * 0.7) return Math.max(1, Math.round(targetWeight * 0.97));
    return Math.round(targetWeight);
}

export function groupExerciseLogsBySession(sessions: WorkoutSessionWithExerciseLogs[], exercise: ExerciseWithLogs): SessionProgress[] {
    return sessions
        .map((session) => {
            const logs = session.logs.filter((log) => log.exerciseId === exercise.localId);
            const completedSets = logs.length;
            const targetSets = exercise.sets ?? 1;
            const averageReps = average(logs.map((log) => log.reps));
            const averageWeight = average(logs.map((log) => log.weight));
            const averageDistance = average(logs.map((log) => log.distance));
            const averageDuration = average(logs.map((log) => log.duration));

            return {
                sessionId: session.localId,
                date: session.date,
                completedSets,
                targetSets,
                averageReps,
                averageWeight,
                averageDistance,
                averageDuration,
                success: false,
                reason: "No evaluation performed yet.",
            };
        })
        .filter((session) => session.completedSets > 0)
        .sort((left, right) => right.date.localeCompare(left.date));
}

function evaluateSessionSuccess(exercise: ExerciseWithLogs, session: SessionProgress): SessionProgress {
    const targetSets = exercise.sets ?? 1;
    const completedSets = session.completedSets;
    const averageReps = session.averageReps ?? 0;
    const averageWeight = session.averageWeight ?? 0;
    const averageDistance = session.averageDistance ?? 0;
    const averageDuration = session.averageDuration ?? 0;

    const meetsSets = completedSets >= targetSets;
    const meetsReps = exercise.reps == null ? true : averageReps >= exercise.reps;
    const meetsWeight = exercise.weight == null ? true : averageWeight >= exercise.weight;
    const meetsDistance = exercise.distance == null ? true : averageDistance >= exercise.distance;
    const meetsDuration = exercise.duration == null ? true : averageDuration >= exercise.duration;

    let success = false;
    let reason = "";

    if (isCardioExercise(exercise)) {
        success = meetsSets && meetsDistance && meetsDuration;
        if (!meetsSets) reason = "Did not complete the scheduled sets.";
        else if (exercise.distance != null && !meetsDistance) reason = "Distance target was not met.";
        else if (exercise.duration != null && !meetsDuration) reason = "Duration target was not met.";
        else reason = "Session met the cardio targets.";
    } else {
        success = meetsSets && meetsReps && meetsWeight;
        if (!meetsSets) reason = "Did not complete the scheduled sets.";
        else if (exercise.reps != null && !meetsReps) reason = "Rep target was not met.";
        else if (exercise.weight != null && !meetsWeight) reason = "Weight target was not met.";
        else reason = "Session met the strength targets.";
    }

    return {
        ...session,
        targetSets,
        success,
        reason,
    };
}

function calculateConsistencyScore(sessions: SessionProgress[], config: ProgressionConfig) {
    const history = sessions.slice(0, config.maxHistorySessions ?? DEFAULT_PROGRESSION_CONFIG.maxHistorySessions!);
    const count = history.length;
    const successCount = history.filter((session) => session.success).length;
    const score = count > 0 ? successCount / count : 0;

    return {
        count,
        successCount,
        score,
        requiredSessions: config.minimumSessions ?? DEFAULT_PROGRESSION_CONFIG.minimumSessions!,
    };
}

export function calculateSuggestedProgression(exercise: ExerciseWithLogs, sessionHistory: WorkoutSessionWithExerciseLogs[], config: ProgressionConfig = {}): ProgressionSuggestion {
    const mergedConfig = { ...DEFAULT_PROGRESSION_CONFIG, ...config };
    const sessionProgress = groupExerciseLogsBySession(sessionHistory, exercise).map((session) => evaluateSessionSuccess(exercise, session));

    if (sessionProgress.length === 0) {
        return {
            confidence: "low",
            reason: "Not enough completed sessions for this exercise yet.",
        };
    }

    const consistency = calculateConsistencyScore(sessionProgress, mergedConfig);

    if (consistency.count < mergedConfig.minimumSessions!) {
        if (consistency.score >= mergedConfig.successRate!) {
            return {
                confidence: "medium",
                reason: `Strong early performance over ${consistency.count} session(s), but not enough data for progression yet. Hold steady.`,
            };
        }

        return {
            confidence: "low",
            reason: "Not enough consistent history yet. Hold steady until more sessions are logged.",
        };
    }

    if (consistency.score < 0.5) {
        const suggestion: ProgressionSuggestion = {
            confidence: "low",
            reason: "Recent performance is inconsistent. Maintain or slightly reduce load until form stabilizes.",
        };

        if (isCardioExercise(exercise)) {
            if (exercise.distance != null) {
                suggestion.suggestedDistance = Math.max(0, (exercise.distance ?? 0) - mergedConfig.distanceIncrement!);
            } else if (exercise.duration != null) {
                suggestion.suggestedDuration = Math.max(0, (exercise.duration ?? 0) - mergedConfig.durationIncrement!);
            }
        } else if (exercise.weight != null) {
            suggestion.suggestedWeight = Math.max(0, (exercise.weight ?? 0) - mergedConfig.weightIncrement!);
        }

        return suggestion;
    }

    if (consistency.score < mergedConfig.successRate!) {
        return {
            confidence: "medium",
            reason: "Performance has been mixed. Hold steady and focus on consistent completion before increasing load.",
        };
    }

    const successfulSessions = sessionProgress.filter((session) => session.success);
    const averageSuccessfulReps = average(successfulSessions.map((session) => session.averageReps));
    const averageSuccessfulWeight = average(successfulSessions.map((session) => session.averageWeight));
    const averageSuccessfulDistance = average(successfulSessions.map((session) => session.averageDistance));
    const averageSuccessfulDuration = average(successfulSessions.map((session) => session.averageDuration));

    const suggestion: ProgressionSuggestion = {
        confidence: "high",
        reason: "Recent sessions show consistent progress. Increase one variable at a time.",
    };

    if (isCardioExercise(exercise)) {
        if (exercise.distance != null && averageSuccessfulDistance != null && averageSuccessfulDistance >= exercise.distance) {
            suggestion.suggestedDistance = roundToIncrement(exercise.distance + mergedConfig.distanceIncrement!, mergedConfig.distanceIncrement!);
            return suggestion;
        }

        if (exercise.duration != null && averageSuccessfulDuration != null && averageSuccessfulDuration >= exercise.duration) {
            suggestion.suggestedDuration = Math.max(1, exercise.duration + mergedConfig.durationIncrement!);
            return suggestion;
        }

        return {
            confidence: "medium",
            reason: "Cardio performance is solid, but there is no single clear progression metric yet. Hold steady.",
        };
    }

    const targetReps = exercise.reps ?? null;
    const targetWeight = exercise.weight ?? null;
    const targetSets = exercise.sets ?? null;

    const shouldIncreaseReps = targetReps != null && averageSuccessfulReps != null && averageSuccessfulReps >= targetReps;
    const shouldIncreaseWeight = targetWeight != null && averageSuccessfulWeight != null && averageSuccessfulWeight >= targetWeight;
    const shouldIncreaseSets = targetSets != null && successfulSessions.every((session) => session.completedSets >= targetSets);

    if (shouldIncreaseReps) {
        suggestion.suggestedReps = targetReps + mergedConfig.repsIncrement!;
        return suggestion;
    }

    if (shouldIncreaseWeight) {
        const weightSuggestion = roundToIncrement(targetWeight + mergedConfig.weightIncrement!, mergedConfig.weightIncrement!);
        suggestion.suggestedWeight = weightSuggestion;
        return suggestion;
    }

    if (shouldIncreaseSets) {
        suggestion.suggestedSets = targetSets + mergedConfig.setsIncrement!;
        return suggestion;
    }

    return {
        confidence: "medium",
        reason: "Sessions are consistently solid, but none of the progression rules are satisfied yet. Hold steady.",
    };
}

interface LogResult {
    perfectDay: boolean;
    streakUpdated: boolean;
    currentStreak?: number;
    longestStreak?: number;
    isNewLongestStreak?: boolean;
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

export async function logExerciseSet(data: LogData): Promise<LogResult> {
    const db = getDb();
    const dateKey = getDateKey();
    const { userId, exerciseId, reps, weight, duration, distance } = data;

    try {
        return await enqueueWrite(() =>
            db.transaction(async (tx) => {
                let session = await tx.query.workoutSessions.findFirst({ where: (fields, { and, eq }) => and(eq(fields.userId, userId), eq(fields.date, dateKey), eq(fields.isDeleted, false)) });

                let sessionId = session?.localId;

                if (!sessionId) {
                    const newId = randomUUID();
                    await tx.insert(schema.workoutSessions).values({
                        localId: newId,
                        userId,
                        date: dateKey,
                        sessionLength: null,
                        perfectDay: false,
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

                await tx.update(schema.workoutSessions).set({ perfectDay, updatedAt: new Date().toISOString(), syncStatus: "pending" }).where(eq(schema.workoutSessions.localId, sessionId));

                if (perfectDay) {
                    const streakResult = await updateStreak(db, data.activePlan);
                    return {
                        perfectDay,
                        streakUpdated: Boolean(streakResult),
                        currentStreak: streakResult?.currentStreak,
                        longestStreak: streakResult?.longestStreak,
                        isNewLongestStreak: streakResult?.isNewLongestStreak ?? false,
                    };
                }

                return {
                    perfectDay,
                    streakUpdated: false,
                };
            }),
        );
    } catch (error) {
        console.error("[logExerciseSet] Error:", error);
        if (error instanceof Error) throw new Error(`Logging failed: ${error.message}`);
        else throw new Error("An unexpected error occurred while saving your set.");
    }
}

async function updateStreak(db: DB, activePlan: WorkoutPlanWithDays): Promise<{ currentStreak: number; longestStreak: number; isNewLongestStreak: boolean } | null> {
    return await db.transaction(async (tx) => {
        const todayKey = getDateKey();
        const planDays = sortWorkoutDays(activePlan.days.map((day) => day.dayName));

        const prevWeekDay = getPreviousWorkoutDay(planDays);

        if (!prevWeekDay) return null;

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

        if (!user) return null;
        if (user.lastStreakAwardedAt === todayKey) return null;

        const previousLongest = user.longestStreak ?? 0;

        const [lastPerfectSession] = await tx
            .select()
            .from(schema.workoutSessions)
            .where(and(eq(schema.workoutSessions.userId, activePlan.userId), eq(schema.workoutSessions.date, prevSessionDate), eq(schema.workoutSessions.perfectDay, true)))
            .limit(1);

        if (!lastPerfectSession) {
            const updatedLongest = Math.max(1, previousLongest);
            await tx
                .update(schema.users)
                .set({
                    currentStreak: 1,
                    longestStreak: updatedLongest,
                    lastStreakAwardedAt: todayKey,
                    updatedAt: new Date().toISOString(),
                    syncStatus: "pending",
                })
                .where(eq(schema.users.localId, activePlan.userId));

            return {
                currentStreak: 1,
                longestStreak: updatedLongest,
                isNewLongestStreak: 1 > previousLongest,
            };
        }

        const newStreak = (user.currentStreak ?? 0) + 1;
        const newLongest = Math.max(newStreak, previousLongest);

        await tx
            .update(schema.users)
            .set({
                currentStreak: newStreak,
                longestStreak: newLongest,
                lastStreakAwardedAt: todayKey,
                syncStatus: "pending",
                updatedAt: new Date().toISOString(),
            })
            .where(eq(schema.users.localId, activePlan.userId));

        return {
            currentStreak: newStreak,
            longestStreak: newLongest,
            isNewLongestStreak: newStreak > previousLongest,
        };
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

export async function resetLocalUserData(localUserId: string) {
    if (!localUserId) throw new Error("resetLocalUserData requires a valid localUserId");

    const database = getDb();

    await enqueueWrite(() =>
        database.transaction(async (tx) => {
            const userId = localUserId;
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
