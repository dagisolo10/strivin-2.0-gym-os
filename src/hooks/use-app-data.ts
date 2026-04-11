import { useUser } from "./use-user";

import { useMemo } from "react";
import * as schema from "@/db/sqlite";
import { and, eq, inArray } from "drizzle-orm";
import { useDrizzle } from "@/context/db-provider";
import { useAuthStore } from "@/store/use-auth-store";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { WorkoutSessionWithLogs, ExerciseWithLogs, WorkoutPlanWithDays } from "@/types/types";

const EMPTY_ID = "__no_match__";

interface UseAppDataOptions {
    includePlanDetails?: boolean;
    includeWorkoutHistory?: boolean;
}

export function useAppData(options: UseAppDataOptions = {}) {
    const { includePlanDetails = false, includeWorkoutHistory = false } = options;
    const db = useDrizzle();

    const { user, loading: userLoading, updatedAt: userUpdatedAt, authInitialized } = useUser();
    const localUserId = useAuthStore((state) => state.localUserId);
    const userId = localUserId ?? EMPTY_ID;

    const { data: plans = [], updatedAt: plansUpdatedAt } = useLiveQuery(
        db.query.workoutPlans.findMany({
            where: eq(schema.workoutPlans.userId, userId),
        }),
        [userId],
    );

    const activePlans = useMemo(() => plans.filter((plan) => !plan.isDeleted), [plans]);
    const planIds = useMemo(() => activePlans.map((plan) => plan.localId), [activePlans]);
    const shouldLoadPlanDetails = includePlanDetails && planIds.length > 0;
    const safePlanIds = shouldLoadPlanDetails ? planIds : [EMPTY_ID];

    const { data: workoutDays = [], updatedAt: workoutDaysUpdatedAt } = useLiveQuery(
        db.query.workoutDays.findMany({
            where: and(eq(schema.workoutDays.userId, userId), inArray(schema.workoutDays.planId, safePlanIds)),
        }),
        [includePlanDetails, safePlanIds.join("|"), userId],
    );

    const { data: exercises = [], updatedAt: exercisesUpdatedAt } = useLiveQuery(
        db.query.exercises.findMany({
            where: and(eq(schema.exercises.userId, userId), inArray(schema.exercises.planId, safePlanIds)),
        }),
        [includePlanDetails, safePlanIds.join("|"), userId],
    );

    const activeWorkoutDays = useMemo(() => workoutDays.filter((day) => !day.isDeleted), [workoutDays]);
    const activeExercises = useMemo(() => exercises.filter((exercise) => !exercise.isDeleted), [exercises]);

    const shouldLoadWorkoutHistory = includeWorkoutHistory && user !== null;

    const { data: sessions = [], updatedAt: sessionsUpdatedAt } = useLiveQuery(
        db.query.workoutSessions.findMany({
            where: eq(schema.workoutSessions.userId, shouldLoadWorkoutHistory ? userId : EMPTY_ID),
        }),
        [includeWorkoutHistory, userId, shouldLoadWorkoutHistory],
    );

    const { data: logs = [], updatedAt: logsUpdatedAt } = useLiveQuery(
        db.query.exerciseLogs.findMany({
            where: eq(schema.exerciseLogs.userId, shouldLoadWorkoutHistory ? userId : EMPTY_ID),
        }),
        [includeWorkoutHistory, userId, shouldLoadWorkoutHistory],
    );

    const logsByExerciseId = useMemo(() => {
        const map = new Map<string, typeof logs>();
        for (const log of logs) {
            const currentLogs = map.get(log.exerciseId);
            if (currentLogs) currentLogs.push(log);
            else map.set(log.exerciseId, [log]);
        }
        return map;
    }, [logs]);

    const logsBySessionId = useMemo(() => {
        const map = new Map<string, typeof logs>();
        for (const log of logs) {
            const currentLogs = map.get(log.sessionId);
            if (currentLogs) currentLogs.push(log);
            else map.set(log.sessionId, [log]);
        }
        return map;
    }, [logs]);

    const exercisesByDayId = useMemo(() => {
        const map = new Map<string, ExerciseWithLogs[]>();
        for (const exercise of activeExercises) {
            const exerciseWithLogs: ExerciseWithLogs = { ...exercise, logs: logsByExerciseId.get(exercise.localId) ?? [] };

            const currentExercises = map.get(exercise.workoutDayId);
            if (currentExercises) currentExercises.push(exerciseWithLogs);
            else map.set(exercise.workoutDayId, [exerciseWithLogs]);
        }
        return map;
    }, [activeExercises, logsByExerciseId]);

    const enrichedPlans = useMemo<WorkoutPlanWithDays[]>(() => {
        return activePlans.map((plan) => ({
            ...plan,
            days: activeWorkoutDays.filter((day) => day.planId === plan.localId).map((day) => ({ ...day, exercises: exercisesByDayId.get(day.localId) ?? [] })),
        }));
    }, [activePlans, activeWorkoutDays, exercisesByDayId]);

    const exercisesById = useMemo(() => {
        const map = new Map<string, (typeof exercises)[number]>();
        for (const exercise of exercises) map.set(exercise.localId, exercise);
        return map;
    }, [exercises]);

    const sessionsWithLogs = useMemo<WorkoutSessionWithLogs[]>(() => {
        return sessions.map((session) => ({
            ...session,
            logs: (logsBySessionId.get(session.localId) ?? [])
                .map((log) => {
                    const exercise = exercisesById.get(log.exerciseId);
                    if (!exercise) return null;
                    return { ...log, exercise };
                })
                .filter((log): log is Extract<typeof log, { exercise: any }> => log !== null),
        }));
    }, [exercisesById, logsBySessionId, sessions]);

    const toTimestamp = (value?: number | Date | null) => (value instanceof Date ? value.getTime() : (value ?? 0));
    const updatedAt = Math.max(
        toTimestamp(userUpdatedAt),
        toTimestamp(plansUpdatedAt),
        toTimestamp(workoutDaysUpdatedAt),
        toTimestamp(exercisesUpdatedAt),
        toTimestamp(sessionsUpdatedAt),
        toTimestamp(logsUpdatedAt),
    );

    const needsPlans = userId !== EMPTY_ID && !plansUpdatedAt;
    const needsPlanDetails = includePlanDetails && userId !== EMPTY_ID && (!workoutDaysUpdatedAt || !exercisesUpdatedAt);
    const needsWorkoutHistory = includeWorkoutHistory && userId !== EMPTY_ID && (!sessionsUpdatedAt || !logsUpdatedAt);

    const isLoading = !authInitialized || userLoading || needsPlans || needsPlanDetails || needsWorkoutHistory;

    return {
        user,
        plans: activePlans,
        workoutDays: activeWorkoutDays,
        exercises: activeExercises,
        sessions,
        logs,
        enrichedPlans,
        sessionsWithLogs,
        isLoading,
        updatedAt,
        plansUpdatedAt,
    };
}
