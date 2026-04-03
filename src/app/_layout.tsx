import "./global.css";
import "react-native-reanimated";

import { useFonts } from "expo-font";
import { Div, P } from "@/components/ui/view";
import { Toaster } from "react-native-sonner";
import migrations from "@/drizzle/migrations";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { SplashScreen, Stack } from "expo-router";
import { Suspense, useEffect, useMemo } from "react";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();
const DATABASE_NAME = "gym.db";

export default function RootLayout() {
    const expoDB = useMemo(() => openDatabaseSync(DATABASE_NAME), []);
    const db = useMemo(() => drizzle(expoDB), [expoDB]);
    const { success, error } = useMigrations(db, migrations);
    useDrizzleStudio(success ? expoDB : null);

    const [fontsLoaded, fontError] = useFonts({
        "sans-regular": require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
        "sans-bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
        "sans-medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
        "sans-semibold": require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
        "sans-extrabold": require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
        "sans-light": require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
    });

    useEffect(() => {
        if (fontsLoaded || fontError) SplashScreen.hideAsync();
    }, [fontError, fontsLoaded]);

    if (fontError) {
        return (
            <Div className="flex-1 items-center justify-center bg-black">
                <P className="text-center text-red-500">Font Error: {fontError.message}</P>
            </Div>
        );
    }

    if (!fontsLoaded) return null;

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
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <SafeAreaProvider>
                        <Stack screenOptions={{ headerShown: false }} />
                        <Toast />
                        <Toaster hapticFeedback />
                    </SafeAreaProvider>
                </GestureHandlerRootView>
            </SQLiteProvider>
        </Suspense>
    );
}
