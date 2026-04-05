import { eq } from "drizzle-orm";
import * as schema from "@/db/sqlite";
import { getDateKey } from "@/lib/helper-functions";

export const DEV_LOCAL_USER_ID = "dev-local-user";
export const DEV_LOCAL_NAME = "Malcom Merlyn";

export async function ensureDevSeed(db: DB) {
    const existingUser = await db.query.users.findFirst({ with: { plans: true, sessions: true } });

    if (existingUser?.plans?.length) return existingUser;

    return db.transaction(async (tx) => {
        let userId = existingUser?.id;

        if (!userId) {
            const [createdUser] = await tx.insert(schema.users).values({ name: DEV_LOCAL_NAME, profile: null }).returning({ id: schema.users.id });

            userId = createdUser.id;
        }

        const [plan] = await tx
            .insert(schema.workoutPlans)
            .values({
                userId,
                workoutDaysPerWeek: 6,
                split: "Push Pull Leg",
                goal: "Hypertrophy",
                fitnessLevel: "Advanced",
            })
            .returning({ id: schema.workoutPlans.id });

        const days = await tx
            .insert(schema.workoutDays)
            .values([
                { userId, planId: plan.id, dayName: "Monday" },
                { userId, planId: plan.id, dayName: "Tuesday" },
                { userId, planId: plan.id, dayName: "Wednesday" },
                { userId, planId: plan.id, dayName: "Thursday" },
                { userId, planId: plan.id, dayName: "Friday" },
                { userId, planId: plan.id, dayName: "Saturday" },
                { userId, planId: plan.id, dayName: "Sunday" },
            ])
            .returning({ id: schema.workoutDays.id, dayName: schema.workoutDays.dayName });

        const mondayId = days.find((day) => day.dayName === "Monday")?.id;
        const tuesdayId = days.find((day) => day.dayName === "Tuesday")?.id;
        const wednesdayId = days.find((day) => day.dayName === "Wednesday")?.id;
        const thursdayId = days.find((day) => day.dayName === "Thursday")?.id;
        const fridayId = days.find((day) => day.dayName === "Friday")?.id;
        const saturdayId = days.find((day) => day.dayName === "Saturday")?.id;
        const sundayId = days.find((day) => day.dayName === "Sunday")?.id;

        if (!mondayId || !wednesdayId || !fridayId || !tuesdayId || !thursdayId || !saturdayId || !sundayId) return;

        const exercises = await tx
            .insert(schema.exercises)
            .values([
                { userId, planId: plan.id, workoutDayId: mondayId, name: "Bench Press", sets: 4, reps: 8, weight: 60, unit: "kg", type: "Push", variant: "Upper" },
                { userId, planId: plan.id, workoutDayId: mondayId, name: "Lat Pulldown", sets: 4, reps: 10, weight: 50, unit: "kg", type: "Pull", variant: "Upper" },
                { userId, planId: plan.id, workoutDayId: tuesdayId, name: "Bench Press", sets: 4, reps: 8, weight: 60, unit: "kg", type: "Push", variant: "Upper" },
                { userId, planId: plan.id, workoutDayId: tuesdayId, name: "Lat Pulldown", sets: 4, reps: 10, weight: 50, unit: "kg", type: "Pull", variant: "Upper" },
                { userId, planId: plan.id, workoutDayId: wednesdayId, name: "Squat", sets: 4, reps: 6, weight: 90, unit: "kg", type: "Legs", variant: "Lower" },
                { userId, planId: plan.id, workoutDayId: wednesdayId, name: "Romanian Dead lift", sets: 3, reps: 8, weight: 70, unit: "kg", type: "Pull", variant: "Lower" },
                { userId, planId: plan.id, workoutDayId: thursdayId, name: "Shoulder Press", sets: 3, reps: 10, weight: 30, unit: "kg", type: "Push", variant: "Upper" },
                { userId, planId: plan.id, workoutDayId: thursdayId, name: "Bike Intervals", sets: 1, duration: 20, distance: 8, unit: "km", type: "Cardio", variant: "Endurance" },
                { userId, planId: plan.id, workoutDayId: fridayId, name: "Shoulder Press", sets: 3, reps: 10, weight: 30, unit: "kg", type: "Push", variant: "Upper" },
                { userId, planId: plan.id, workoutDayId: fridayId, name: "Bike Intervals", sets: 1, duration: 20, distance: 8, unit: "km", type: "Cardio", variant: "Endurance" },
                { userId, planId: plan.id, workoutDayId: saturdayId, name: "Squat", sets: 4, reps: 6, weight: 90, unit: "kg", type: "Legs", variant: "Lower" },
                { userId, planId: plan.id, workoutDayId: saturdayId, name: "Squat", sets: 4, reps: 6, weight: 90, unit: "kg", type: "Legs", variant: "Lower" },
                { userId, planId: plan.id, workoutDayId: sundayId, name: "Romanian Dead lift", sets: 3, reps: 8, weight: 70, unit: "kg", type: "Pull", variant: "Lower" },
                { userId, planId: plan.id, workoutDayId: sundayId, name: "Romanian Dead lift", sets: 3, reps: 8, weight: 70, unit: "kg", type: "Pull", variant: "Lower" },
            ])
            .returning({ id: schema.exercises.id, name: schema.exercises.name });

        const [session] = await tx.insert(schema.workoutSessions).values({ userId, date: getDateKey(), perfectDay: false }).returning({ id: schema.workoutSessions.id });

        const bench = exercises.find((exercise) => exercise.name === "Bench Press");
        const pulldown = exercises.find((exercise) => exercise.name === "Lat Pulldown");

        if (bench && pulldown) {
            await tx.insert(schema.exerciseLogs).values([
                { userId, sessionId: session.id, exerciseId: bench.id, reps: 8, weight: 60, completed: true, date: getDateKey() },
                { userId, sessionId: session.id, exerciseId: pulldown.id, reps: 10, weight: 50, completed: true, date: getDateKey() },
            ]);
        }

        return tx.query.users.findFirst({
            with: {
                plans: true,
                sessions: true,
            },
        });
    });
}

export async function clearDevSeed(db: DB) {
    const localUser = await db.query.users.findFirst();

    if (!localUser) return;

    await db.delete(schema.users).where(eq(schema.users.id, localUser.id));
}
