import { db } from "@/db/client";
import * as schema from "@/db/sqlite";
import { Exercise } from "@/types/interface";

interface OnboardingState {
    name: string;
    split: WorkoutSplit;
    workoutDays: string[];
    exercises: Exercise[];
    goal: Goal;
    profile: string | null;
}

export async function registerUser(data: OnboardingState) {
    console.log("FINAL DATA SUBMISSION:", JSON.stringify(data, null, 2));

    return await db.transaction(async (tx) => {
        const [user] = await tx
            .insert(schema.users)
            .values({
                name: data.name,
                profile: data.profile,
            })
            .returning({ id: schema.users.id });

        const [plan] = await tx
            .insert(schema.workoutPlans)
            .values({
                userId: user.id,
                split: data.split,
                workoutDaysPerWeek: data.workoutDays.length,
                goal: data.goal,
            })
            .returning({ id: schema.workoutPlans.id });

        const dayRecords = await tx
            .insert(schema.workoutDays)
            .values(
                data.workoutDays.map((day) => ({
                    planId: plan.id,
                    dayName: day,
                })),
            )
            .returning({ id: schema.workoutDays.id, dayName: schema.workoutDays.dayName });

        if (data.exercises && data.exercises.length > 0 && dayRecords.length > 0) {
            const exerciseData = data.exercises
                .flatMap((exercise) => {
                    const selectedDays = exercise.workoutDays || [];
                    return selectedDays.map((selectedDayName) => {
                        const dayRecord = dayRecords.find((day) => day.dayName === selectedDayName);

                        if (!dayRecord) {
                            console.warn(`No record found for day: ${selectedDayName}`);
                            return null;
                        }

                        return {
                            workoutDayId: dayRecord.id,
                            name: exercise.name,
                            sets: exercise.sets,
                            reps: exercise.reps,
                            weight: exercise.weight,
                            distance: exercise.distance,
                            duration: exercise.duration,
                            unit: exercise.unit,
                            type: exercise.type,
                            variant: exercise.variant,
                        };
                    });
                })
                .filter((ex): ex is NonNullable<typeof ex> => ex !== null);

            if (exerciseData.length > 0) await tx.insert(schema.exercises).values(exerciseData);
            else console.error("ExerciseData was empty after flatMap. Check if workoutDays matches dayRecords.");
        }
        return { success: true, userId: user.id };
    });
}
