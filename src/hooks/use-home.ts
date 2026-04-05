import { useMemo } from "react";
import { getDateKey } from "@/lib/helper-functions";
import { usePlanStore } from "@/store/use-plan-store";
import { UserWithRelations } from "@/store/use-static-store";

interface UseHomeDataUser extends UserWithRelations {
    id: number;
}

export function useHomeData(user: UseHomeDataUser | null | undefined, selectedDayName: Weekday) {
    const selectedPlanId = usePlanStore((state) => state.selectedPlanId);

    const todayKey = getDateKey();

    const plans = user?.plans || [];
    const plan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];

    const workoutDay = plan?.days?.find((day) => day.dayName === selectedDayName);
    const workoutDayId = workoutDay?.id;

    const exercises = useMemo(() => {
        if (workoutDayId === undefined || workoutDayId === null) return [];
        return workoutDay?.exercises || [];
    }, [workoutDayId, workoutDay]);

    const todaysLogs = useMemo(() => {
        return user?.sessions?.find((session) => session.date === todayKey)?.logs.map((log) => ({ ...log, exerciseId: log.exercise?.id })) || [];
    }, [user?.sessions, todayKey]);

    return { plan, plans, workoutDay, exercises, todaysLogs, todayKey };
}
