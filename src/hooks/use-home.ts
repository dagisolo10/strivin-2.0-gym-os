import { useMemo } from "react";
import { SessionWithRelations } from "@/types/model";
import { getDateKey, getWeekdayName } from "@/lib/helper-functions";
import { WorkoutDay, ExerciseLog, WorkoutPlanWithDays } from "@/types/types";

interface HomeDataOptions {
    activePlan: WorkoutPlanWithDays | null;
    workoutDays: WorkoutDay[];
    sessions: SessionWithRelations[];
    logs: ExerciseLog[];
}

export function useHomeData(selectedDayName: Weekday | undefined, { activePlan, workoutDays, sessions, logs }: HomeDataOptions) {
    const todayKey = getDateKey();
    const dayName = selectedDayName ?? getWeekdayName();

    const { workoutDay, todaysExercises, totalSets, totalExercises, todaysSession, todaysLogs, todaysLogsByExerciseId, progress } = useMemo(() => {
        const workoutDay = workoutDays.find((day) => day.dayName === dayName);
        const todaysExercises = activePlan?.days?.find((day) => day.localId === workoutDay?.localId)?.exercises ?? [];
        const todaysSession = sessions.find((session) => session.date === todayKey);
        const todaysLogs = logs.filter((log) => log.sessionId === todaysSession?.localId);
        const todaysLogsByExerciseId = todaysLogs.reduce<Record<string, ExerciseLog[]>>((accumulator, log) => {
            accumulator[log.exerciseId] = [...(accumulator[log.exerciseId] ?? []), log];
            return accumulator;
        }, {});
        const totalSets = todaysExercises.reduce((sum, exercise) => sum + (exercise.sets ?? 1), 0);
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
