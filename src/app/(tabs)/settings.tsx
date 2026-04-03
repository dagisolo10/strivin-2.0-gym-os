import * as schema from "@/db/sqlite";
import React, { useMemo } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { H1, Screen } from "@/components/ui/view";
import { Button, NavLink } from "@/components/ui/button";

export default function Settings() {
    const db = useSQLiteContext();
    const drizzleDB = useMemo(() => drizzle(db, { schema }), [db]);

    async function reset() {
        await Promise.all([drizzleDB.delete(schema.users), drizzleDB.delete(schema.workoutDays), drizzleDB.delete(schema.workoutPlans), drizzleDB.delete(schema.workoutSessions), drizzleDB.delete(schema.exerciseLogs), drizzleDB.delete(schema.exercises)]);
    }

    return (
        <Screen className="items-center justify-center gap-8">
            <H1>Settings</H1>

            <Button onPress={reset}>Reset</Button>

            <NavLink href="/home" textClassName="text-4xl ">
                Profile
            </NavLink>
        </Screen>
    );
}
