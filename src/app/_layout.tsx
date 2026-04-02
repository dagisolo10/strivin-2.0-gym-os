import "./global.css";
import "react-native-reanimated";

import { Stack } from "expo-router";
import { Suspense, useMemo } from "react";
import { Div, P } from "@/components/ui/view";
import migrations from "@/drizzle/migrations";
import { ActivityIndicator } from "react-native";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { SafeAreaProvider } from "react-native-safe-area-context";

const DATABASE_NAME = "gym.db";

export default function RootLayout() {
    const expoDB = useMemo(() => openDatabaseSync(DATABASE_NAME), []);
    const db = useMemo(() => drizzle(expoDB), [expoDB]);
    const { success, error } = useMigrations(db, migrations);
    useDrizzleStudio(success ? expoDB : null);

    if (error) {
        return (
            <Div className="flex-1 items-center justify-center bg-black">
                <P className="text-center text-red-500">Migration Error: {error.message}</P>
            </Div>
        );
    }

    if (!success) {
        return (
            <Div className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator size="large" color="#3b82f6" />
                <P className="mt-4 text-white">Setting up database...</P>
            </Div>
        );
    }

    return (
        <Suspense fallback={<ActivityIndicator size={"large"} />}>
            <SQLiteProvider databaseName={DATABASE_NAME} options={{ enableChangeListener: true }} useSuspense>
                <SafeAreaProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                </SafeAreaProvider>
            </SQLiteProvider>
        </Suspense>
    );
}
