import "./global.css";
import "react-native-reanimated";

import { Suspense } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import migrations from "@/drizzle/migrations";
import { ActivityIndicator } from "react-native";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { SafeAreaProvider } from "react-native-safe-area-context";

const DATABASE_NAME = "databaseName.db";

export default function RootLayout() {
    const expoDB = openDatabaseSync(DATABASE_NAME);
    const db = drizzle(expoDB);
    useMigrations(db, migrations);

    return (
        <Suspense fallback={<ActivityIndicator size={"large"} />}>
            <SQLiteProvider databaseName={DATABASE_NAME} options={{ enableChangeListener: true }} useSuspense>
                <SafeAreaProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                    <StatusBar style="light" />
                </SafeAreaProvider>
            </SQLiteProvider>
        </Suspense>
    );
}
