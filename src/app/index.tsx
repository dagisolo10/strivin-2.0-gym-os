import * as schema from "@/db/sqlite";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Screen } from "@/components/ui/view";
import { useSQLiteContext } from "expo-sqlite";
import { ActivityIndicator } from "react-native";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";

export default function Index() {
    const db = useSQLiteContext();
    const drizzleDB = drizzle(db, { schema });
    const router = useRouter();

    const { data: user, updatedAt } = useLiveQuery(drizzleDB.query.users.findFirst());

    useEffect(() => {
        const checkUser = async () => {
            if (updatedAt) {
                if (user) router.replace("/(tabs)/profile");
                else router.replace("/onboarding" as any);
            }
        };
        checkUser();
    }, [user, updatedAt, router]);

    return (
        <Screen className="items-center justify-center">
            <ActivityIndicator size="large" color="#3b82f6" />
        </Screen>
    );
}
