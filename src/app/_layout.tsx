import "./global.css";
import "react-native-reanimated";

import { useFonts } from "expo-font";
import { posthog } from "@/lib/posthog";
import { Toaster } from "react-native-sonner";
import migrations from "@/drizzle/migrations";
import { getDb, getExpoDb } from "@/db/client";
import * as Sentry from "@sentry/react-native";
import { SplashScreen, Stack } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import { DrizzleProvider } from "@/context/db-provider";
import { ClerkProvider, ClerkLoaded } from "@clerk/expo";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorScreen, LoadingScreen } from "@/components/ui/screen-ui";
import React, { Suspense, useEffect, useState, useCallback } from "react";

SplashScreen.preventAutoHideAsync();
Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, debug: __DEV__ });
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

function RootLayout() {
    const expoDB = getExpoDb();
    const drizzleDB = getDb();

    const [fontsLoaded, fontError] = useFonts(fonts);
    const [isClerkLoaded, setIsClerkLoaded] = useState(false);

    const { error, success } = useMigrations(drizzleDB, migrations);
    useDrizzleStudio(success ? expoDB : null);

    const handleClerkReady = useCallback(() => setIsClerkLoaded(true), []);
    const isReady = (fontsLoaded || fontError) && (success || error) && isClerkLoaded;

    useEffect(() => {
        if (isReady) SplashScreen.hideAsync();
    }, [isReady]);

    if (!publishableKey) throw Error("Add your Clerk Publishable Key to the .env file");

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

    return (
        <ClerkProvider publishableKey={publishableKey}>
            <ClerkLoaded>
                <ClerkReadyHandler onReady={handleClerkReady} />
                {posthog ? <PostHogProvider client={posthog}>{layoutContent}</PostHogProvider> : layoutContent}
            </ClerkLoaded>
        </ClerkProvider>
    );
}

const ClerkReadyHandler = ({ onReady }: { onReady: () => void }) => {
    useEffect(() => {
        onReady();
    }, [onReady]);
    return null;
};

const fonts = {
    "sans-regular": require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
};

export default Sentry.wrap(RootLayout);
