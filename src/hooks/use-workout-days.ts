import { useAppData } from "./use-app-data";

export function useWorkoutDays() {
    const { workoutDays } = useAppData({ includePlanDetails: true });

    return {
        workoutDays,
    };
}
