import "./global.css";
import "react-native-reanimated";

import { useFonts } from "expo-font";
import { posthog } from "@/lib/posthog";
import { Toaster } from "react-native-sonner";
import migrations from "@/drizzle/migrations";
import { getDb, getExpoDb } from "@/db/client";
import * as Sentry from "@sentry/react-native";
import { SplashScreen, Stack } from "expo-router";
import React, { Suspense, useEffect } from "react";
import { PostHogProvider } from "posthog-react-native";
import { DrizzleProvider } from "@/context/db-provider";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorScreen, LoadingScreen } from "@/components/ui/screen-ui";

SplashScreen.preventAutoHideAsync();
Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, debug: false });

function RootLayout() {
    const expoDB = getExpoDb();
    const drizzleDB = getDb();

    const [fontsLoaded, fontError] = useFonts(fonts);

    const { error, success } = useMigrations(drizzleDB, migrations);
    useDrizzleStudio(success ? expoDB : null);

    const isReady = (fontsLoaded || fontError) && (success || error);

    useEffect(() => {
        if (isReady) SplashScreen.hideAsync();
    }, [isReady]);

    const renderContent = () => {
        if (error || fontError) return <ErrorScreen message={error?.message || fontError?.message} />;
        if (!success || !fontsLoaded) return <LoadingScreen />;

        return (
            <Suspense fallback={<LoadingScreen />}>
                <DrizzleProvider db={drizzleDB}>
                    <Stack screenOptions={{ headerShown: false }} />
                    <Toaster hapticFeedback />
                </DrizzleProvider>
            </Suspense>
        );
    };

    const layoutContent = (
        <GestureHandlerRootView style={{ flex: 1, opacity: isReady ? 1 : 0 }}>
            <SafeAreaProvider>{renderContent()}</SafeAreaProvider>
        </GestureHandlerRootView>
    );

    return posthog ? <PostHogProvider client={posthog}>{layoutContent}</PostHogProvider> : layoutContent;
}

const fonts = {
    "sans-regular": require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
};

export default Sentry.wrap(RootLayout);
