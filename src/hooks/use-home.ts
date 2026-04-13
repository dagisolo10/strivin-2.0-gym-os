import { useMemo } from "react";
import { getDateKey, getWeekdayName } from "@/lib/helper-functions";
import { WorkoutDay, ExerciseLog, WorkoutPlanWithDays, WorkoutSessionWithLogs } from "@/types/types";

interface HomeDataOptions {
    activePlan: WorkoutPlanWithDays | null;
    workoutDays: WorkoutDay[];
    sessions: WorkoutSessionWithLogs[];
    logs: ExerciseLog[];
}

export function useHomeData(selectedDayName: Weekday | undefined, { activePlan, workoutDays, sessions, logs }: HomeDataOptions) {
    const todayKey = getDateKey();
    const dayName = selectedDayName ?? getWeekdayName();

    const { workoutDay, todaysExercises, totalSets, totalExercises, todaysSession, todaysLogs, todaysLogsByExerciseId, progress } = useMemo(() => {
        const activePlanDay = activePlan?.days.find((day) => day.dayName === dayName);
        const workoutDay = activePlanDay ?? workoutDays.find((day) => day.dayName === dayName && day.planId === activePlan?.localId);

        const todaysExercises = activePlanDay?.exercises ?? [];

        const todaysSession = sessions.find((session) => session.date === todayKey);

        const todaysSessionIds = sessions.filter((session) => session.date === todayKey).map((s) => s.localId);

        const todaysLogs = logs.filter((log) => todaysSessionIds.includes(log.sessionId));

        const todaysLogsByExerciseId = todaysLogs.reduce<Record<string, ExerciseLog[]>>((acc, log) => {
            acc[log.exerciseId] = [...(acc[log.exerciseId] ?? []), log];
            return acc;
        }, {});

        const totalSets = todaysExercises.reduce((sum: number, exercise) => sum + (exercise.sets ?? 1), 0);

        const totalExercises = activePlan?.days?.reduce((sum, day) => sum + (day.exercises?.length ?? 0), 0) ?? 0;

        const completedSets = todaysLogs.length;

        const progress = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;

        return { workoutDay, todaysExercises, totalSets, totalExercises, todaysSession, todaysLogs, todaysLogsByExerciseId, progress };
    }, [activePlan, dayName, logs, sessions, todayKey, workoutDays]);

    return {
        tables: { workoutDay, todaysSession, todaysExercises, todaysLogsByExerciseId },
        values: { progress, totalExercises, completedSets: todaysLogs.length, totalSets },
    };
}
