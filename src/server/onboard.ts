import { getDb } from "@/db/client";
import { supabase } from "@/lib/supabase";
import { enqueueWrite } from "@/db/write-queue";
import { exercises, users, workoutDays, workoutPlans } from "@/db/sqlite";

interface ExerciseInput {
    name: string;
    workoutDays: Weekday[];
    unit?: Unit | null;
    usesWeight?: boolean;
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
    const db = getDb();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    return enqueueWrite(() =>
        db.transaction(async (tx) => {
            const [user] = await tx
                .insert(users)
                .values({
                    supabaseId: session?.user.id,
                    name: data.name,
                    profile: data.profile,
                })
                .returning({ localId: users.localId });

            const [plan] = await tx
                .insert(workoutPlans)
                .values({
                    userId: user.localId,
                    split: data.split,
                    workoutDaysPerWeek: data.workoutDays.length,
                    goal: data.goal ?? null,
                    fitnessLevel: data.fitnessLevel ?? null,
                })
                .returning({ localId: workoutPlans.localId });

            const newDayRecords = data.workoutDays.map((day) => ({ dayName: day, userId: user.localId, planId: plan.localId }));
            const insertedWorkoutDays = await tx.insert(workoutDays).values(newDayRecords).returning({ localId: workoutDays.localId, dayName: workoutDays.dayName });

            if (data.exercises && data.exercises.length > 0 && newDayRecords.length > 0) {
                const exerciseData = data.exercises
                    .flatMap((exercise) =>
                        exercise.workoutDays.map((selectedDayName) => {
                            const dayRecord = insertedWorkoutDays.find((day) => day.dayName === selectedDayName);
                            if (!dayRecord) return null;

                            return {
                                userId: user.localId,
                                planId: plan.localId,
                                workoutDayId: dayRecord.localId,
                                name: exercise.name,
                                sets: exercise.sets ?? null,
                                reps: exercise.reps ?? null,
                                weight: exercise.weight ?? null,
                                distance: exercise.distance ?? null,
                                duration: exercise.duration ?? null,
                                unit: exercise.unit ?? null,
                                type: exercise.type,
                                variant: exercise.variant,
                            };
                        }),
                    )
                    .filter((exercise): exercise is NonNullable<typeof exercise> => exercise !== null);

                if (exerciseData.length > 0) {
                    await tx.insert(exercises).values(exerciseData);
                }
            }

            return { success: true, userId: user.localId };
        }),
    );
}
