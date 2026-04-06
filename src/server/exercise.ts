import { useStaticStore, Exercise } from "@/store/use-static-store";

type NewExercise = Omit<Exercise, "id" | "userId" | "planId" | "workoutDayId">;

interface Data {
    userId: string;
    planId: string;
    exercise: NewExercise;
    workoutDays: Weekday[];
}

export async function addExercise(data: Data) {
    try {
        const store = useStaticStore.getState();
        const plan = store.plans.find((p) => p.localId === data.planId);
        if (!plan) return { success: false, error: "Plan not found" };

        for (const day of data.workoutDays) {
            let workoutDay = store.workoutDays.find((d) => d.planId === plan.localId && d.dayName === day);

            if (!workoutDay) {
                workoutDay = store.createWorkoutDay({
                    userId: data.userId,
                    dayName: day,
                    planId: plan.localId,
                });
            }

            store.createExercise({
                ...data.exercise,
                userId: data.userId,
                planId: data.planId,
                workoutDayId: workoutDay.localId,
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error in addExercise", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
