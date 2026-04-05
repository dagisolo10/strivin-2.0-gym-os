import { useStaticStore, WorkoutDay } from "@/store/use-static-store";

export interface ExerciseInput {
    name: string;
    workoutDays: Weekday[];
    unit: Unit;
    sets?: number;
    reps?: number;
    weight?: number;
    distance?: number;
    duration?: number;
    type: ExerciseType;
    variant: ExerciseVariant;
}

interface SavePlanInput {
    userId: number;
    planId?: number;
    split: WorkoutSplit;
    workoutDays: Weekday[];
    exercises?: ExerciseInput[];
    goal?: Goal | null;
    sessionLength?: number;
    fitnessLevel?: FitnessLevel | null;
}

export async function saveWorkoutPlan(data: SavePlanInput) {
    const userId = data.userId;
    const store = useStaticStore.getState();

    try {
        let planId = data.planId;

        if (planId) {
            const existingPlan = store.plans.find((plan) => plan.id === planId && plan.userId === userId);
            if (!existingPlan) throw new Error("Plan not found");

            store.updatePlan(planId, {
                split: data.split,
                workoutDaysPerWeek: data.workoutDays.length,
                goal: data.goal ?? null,
                fitnessLevel: data.fitnessLevel ?? null,
            });

            // Delete existing days for this plan
            const existingDays = store.workoutDays.filter((day) => day.planId === planId);
            existingDays.forEach((day) => store.deleteWorkoutDay(day.id));
        } else {
            const newPlan = store.createPlan({
                split: data.split,
                workoutDaysPerWeek: data.workoutDays.length,
                goal: data.goal ?? null,
                fitnessLevel: data.fitnessLevel ?? null,
            });
            planId = newPlan.id;
        }

        const dayRecords: WorkoutDay[] = data.workoutDays.map((day) => store.createWorkoutDay({ userId, planId: planId!, dayName: day }));

        if (data.exercises && data.exercises.length > 0) {
            const exerciseData = data.exercises
                .flatMap((exercise) =>
                    (exercise.workoutDays || []).map((selectedDayName: Weekday) => {
                        const dayRecord = dayRecords.find((day) => day.dayName === selectedDayName);
                        if (!dayRecord) return null;

                        return {
                            userId,
                            planId: planId!,
                            workoutDayId: dayRecord.id,
                            name: exercise.name,
                            sets: exercise.sets ?? null,
                            reps: exercise.reps ?? null,
                            weight: exercise.weight ?? null,
                            distance: exercise.distance ?? null,
                            duration: exercise.duration ?? null,
                            unit: exercise.unit,
                            type: exercise.type,
                            variant: exercise.variant,
                        };
                    }),
                )
                .filter((exercise): exercise is NonNullable<typeof exercise> => exercise !== null);

            if (exerciseData.length) {
                exerciseData.forEach((ex) => store.createExercise(ex));
            }
        }

        return { success: true as const, planId: planId! };
    } catch (error) {
        console.error("saveWorkoutPlan error", error);
        return { success: false as const, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function deleteWorkoutPlan(userId: number, planId: number) {
    try {
        const store = useStaticStore.getState();

        const plan = store.plans.find((plan) => plan.id === planId);
        if (!plan || plan.userId !== userId) throw new Error("Plan not found");

        const deleted = store.deletePlan(planId);
        if (!deleted) throw new Error("Plan not found");
        return { success: true as const };
    } catch (error) {
        console.error("deleteWorkoutPlan error", error);
        return { success: false as const, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
