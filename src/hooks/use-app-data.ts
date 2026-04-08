import { useEffect, useMemo, useRef, useState } from "react";
import * as schema from "@/db/sqlite";
import { eq, inArray } from "drizzle-orm";
import { useDrizzle } from "@/context/db-provider";
import { SessionWithRelations } from "@/types/model";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { ExerciseWithLogs, WorkoutPlanWithDays } from "@/types/types";

const EMPTY_ID = "__no_match__";

interface UseAppDataOptions {
    includePlanDetails?: boolean;
    includeWorkoutHistory?: boolean;
}

export function useAppData(options: UseAppDataOptions = {}) {
    const { includePlanDetails = false, includeWorkoutHistory = false } = options;
    const db = useDrizzle();

    const { data: userData, updatedAt: userUpdatedAt } = useLiveQuery(db.query.users.findFirst());
    const user = userData ?? null;
    const userId = user?.localId ?? EMPTY_ID;

    const { data: plans = [], updatedAt: plansUpdatedAt } = useLiveQuery(
        db.query.workoutPlans.findMany({
            where: eq(schema.workoutPlans.userId, userId),
        }),
        [userId],
    );

    const [loadedPlansUserId, setLoadedPlansUserId] = useState<string | null>(null);
    const previousPlansUpdatedAtRef = useRef<number | null>(null);

    const planIds = useMemo(() => plans.map((plan) => plan.localId), [plans]);
    const shouldLoadPlanDetails = includePlanDetails && planIds.length > 0;
    const safePlanIds = shouldLoadPlanDetails ? planIds : [EMPTY_ID];

    const { data: workoutDays = [], updatedAt: workoutDaysUpdatedAt } = useLiveQuery(
        db.query.workoutDays.findMany({
            where: inArray(schema.workoutDays.planId, safePlanIds),
        }),
        [includePlanDetails, safePlanIds.join("|")],
    );

    const { data: exercises = [], updatedAt: exercisesUpdatedAt } = useLiveQuery(
        db.query.exercises.findMany({
            where: inArray(schema.exercises.planId, safePlanIds),
        }),
        [includePlanDetails, safePlanIds.join("|")],
    );

    const shouldLoadWorkoutHistory = includeWorkoutHistory && user !== null;

    const { data: sessions = [], updatedAt: sessionsUpdatedAt } = useLiveQuery(
        db.query.workoutSessions.findMany({
            where: eq(schema.workoutSessions.userId, shouldLoadWorkoutHistory ? userId : EMPTY_ID),
        }),
        [includeWorkoutHistory, userId],
    );

    const { data: logs = [], updatedAt: logsUpdatedAt } = useLiveQuery(
        db.query.exerciseLogs.findMany({
            where: eq(schema.exerciseLogs.userId, shouldLoadWorkoutHistory ? userId : EMPTY_ID),
        }),
        [includeWorkoutHistory, userId],
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
        for (const exercise of exercises) {
            const exerciseWithLogs: ExerciseWithLogs = {
                ...exercise,
                logs: logsByExerciseId.get(exercise.localId) ?? [],
            };

            const currentExercises = map.get(exercise.workoutDayId);
            if (currentExercises) currentExercises.push(exerciseWithLogs);
            else map.set(exercise.workoutDayId, [exerciseWithLogs]);
        }
        return map;
    }, [exercises, logsByExerciseId]);

    const enrichedPlans = useMemo<WorkoutPlanWithDays[]>(() => {
        return plans.map((plan) => ({
            ...plan,
            days: workoutDays
                .filter((day) => day.planId === plan.localId)
                .map((day) => ({
                    ...day,
                    exercises: exercisesByDayId.get(day.localId) ?? [],
                })),
        }));
    }, [exercisesByDayId, plans, workoutDays]);

    const exercisesById = useMemo(() => {
        const map = new Map<string, (typeof exercises)[number]>();
        for (const exercise of exercises) {
            map.set(exercise.localId, exercise);
        }
        return map;
    }, [exercises]);

    const sessionsWithLogs = useMemo<SessionWithRelations[]>(() => {
        return sessions.map((session) => ({
            ...session,
            logs: (logsBySessionId.get(session.localId) ?? []).map((log) => ({
                ...log,
                exercise: exercisesById.get(log.exerciseId)!,
            })),
        }));
    }, [exercisesById, logsBySessionId, sessions]);

    const toTimestamp = (value?: number | Date) => (value instanceof Date ? value.getTime() : (value ?? 0));
    const updatedAt = Math.max(toTimestamp(userUpdatedAt), toTimestamp(plansUpdatedAt), toTimestamp(workoutDaysUpdatedAt), toTimestamp(exercisesUpdatedAt), toTimestamp(sessionsUpdatedAt), toTimestamp(logsUpdatedAt));

    useEffect(() => {
        if (userId === EMPTY_ID) {
            setLoadedPlansUserId(null);
            return;
        }

        const currentPlansUpdatedAt = plansUpdatedAt ? toTimestamp(plansUpdatedAt) : null;
        const previousPlansUpdatedAt = previousPlansUpdatedAtRef.current;

        if (currentPlansUpdatedAt !== previousPlansUpdatedAt) {
            previousPlansUpdatedAtRef.current = currentPlansUpdatedAt;

            if (currentPlansUpdatedAt !== null) {
                setLoadedPlansUserId(userId);
            }
        }
    }, [plansUpdatedAt, userId]);

    const plansLoadedForCurrentUser = userId === EMPTY_ID || loadedPlansUserId === userId;
    
    const isLoading = includeWorkoutHistory
        ? !sessionsUpdatedAt || !logsUpdatedAt || (!userUpdatedAt && user === null)
        : includePlanDetails
          ? !workoutDaysUpdatedAt || !exercisesUpdatedAt || !plansLoadedForCurrentUser || !userUpdatedAt
          : !plansLoadedForCurrentUser || !userUpdatedAt;

    return {
        user,
        plans,
        workoutDays,
        exercises,
        sessions,
        logs,
        enrichedPlans,
        sessionsWithLogs,
        isLoading,
        updatedAt,
        plansUpdatedAt,
    };
}
