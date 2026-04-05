import { useStaticStore } from "@/store/use-static-store";

interface ExerciseInput {
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

interface OnboardingState {
    name: string;
    split: WorkoutSplit;
    workoutDays: Weekday[];
    exercises?: ExerciseInput[];
    goal?: Goal | null;
    sessionLength?: number;
    fitnessLevel?: FitnessLevel | null;
    profile: string | null;
}

export async function registerUser(data: OnboardingState) {
    const store = useStaticStore.getState();

    const user = store.createUser(data.name, data.profile);

    const plan = store.createPlan({
        split: data.split,
        workoutDaysPerWeek: data.workoutDays.length,
        goal: data.goal ?? null,
        fitnessLevel: data.fitnessLevel ?? null,
    });

    // Create workout days
    const dayRecords = data.workoutDays.map((day) => store.createWorkoutDay({ userId: user.id, planId: plan.id, dayName: day }));

    // Create exercises
    if (data.exercises && data.exercises.length > 0 && dayRecords.length > 0) {
        const exerciseData = data.exercises
            .flatMap((exercise) => {
                const selectedDays = exercise.workoutDays;

                return selectedDays.map((selectedDayName) => {
                    const dayRecord = dayRecords.find((day) => day.dayName === selectedDayName);

                    if (!dayRecord) {
                        console.warn(`No record found for day: ${selectedDayName}`);
                        return null;
                    }

                    return {
                        userId: user.id,
                        planId: plan.id,
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
                });
            })
            .filter((ex): ex is NonNullable<typeof ex> => ex !== null);

        if (exerciseData.length > 0) {
            exerciseData.forEach((ex) => store.createExercise(ex));
        } else {
            console.error("ExerciseData was empty after flatMap. Check if workoutDays matches dayRecords.");
        }
    }

    store.createSession({
        userId: user.id,
        date: new Date().toISOString().split("T")[0],
        sessionLength: data.sessionLength ?? null,
        perfectDay: false,
    });

    return { success: true, userId: user.id };
}
