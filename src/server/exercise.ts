import * as schema from "@/db/sqlite";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";

type NewExercise = Omit<typeof schema.exercises.$inferInsert, "workoutDayId">;

interface Data {
    planId: number;
    exercise: NewExercise;
    workoutDays: Weekday[];
}

export async function addExercise(data: Data, drizzleDB: ExpoSQLiteDatabase<typeof schema>) {
    try {
        const plan = await drizzleDB.query.workoutPlans.findFirst({ where: (workoutPlans, { eq }) => eq(workoutPlans.id, data.planId) });
        if (!plan) return { success: false, error: "Plan not found" };

        await drizzleDB.transaction(async (tx) => {
            for (const day of data.workoutDays) {
                const workoutDay = await tx.query.workoutDays.findFirst({
                    where: (workoutDays, { eq, and }) => and(eq(workoutDays.planId, plan.id), eq(workoutDays.dayName, day)),
                });
                let workoutDayId;

                if (!workoutDay) {
                    const [newDay] = await tx.insert(schema.workoutDays).values({ dayName: day, planId: plan.id }).returning({ id: schema.workoutDays.id });
                    workoutDayId = newDay.id;
                } else {
                    workoutDayId = workoutDay.id;
                }

                await tx.insert(schema.exercises).values({ ...data.exercise, workoutDayId });
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Error in addExercise", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
