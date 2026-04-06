import { useMemo } from "react";
import { calculateStreak } from "@/server/workout";
import type { UserWithRelations } from "@/types/model";
import { getWeekdayName } from "@/lib/helper-functions";

export function useWorkoutSession(user: UserWithRelations | null, selectedPlanId: string | null) {
    return useMemo(() => {
        if (!user) return null;

        const plans = user.plans;
        const plan = plans.find((plan) => plan.localId === selectedPlanId) ?? plans[0];
        if (!plan) return null;

        const today = getWeekdayName();
        const todayKey = new Date().toISOString().slice(0, 10);
        const exerciseDay = plan.days.find((day) => day.dayName === today) ?? plan.days[0];

        const todaysSession = (user.sessions ?? []).find((session) => session.date === todayKey);
        const todaysLogs = todaysSession?.logs ?? [];

        const totalSets = (exerciseDay?.exercises).reduce((sum, exercise) => sum + (exercise.sets ?? 1), 0);
        const completedSets = todaysLogs.length;
        const progress = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;
        const streak = calculateStreak(user.sessions);

        return { plan, today, todayKey, exerciseDay, todaysSession, todaysLogs, totalSets, completedSets, progress, streak };
    }, [selectedPlanId, user]);
}
