import "./global.css";
import "react-native-reanimated";

import { useFonts } from "expo-font";
import { useEffect, Suspense } from "react";
import { Toaster } from "react-native-sonner";
import { ActivityIndicator } from "react-native";
import { SplashScreen, Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorScreen, LoadingScreen } from "@/components/ui/screen-ui";

SplashScreen.preventAutoHideAsync();

function RootContent() {
    const [fontsLoaded, fontError] = useFonts(fonts);

    useEffect(() => {
        (fontsLoaded || fontError) && SplashScreen.hideAsync();
    }, [fontError, fontsLoaded]);

    if (fontError) return <ErrorScreen message={fontError.message} />;
    if (!fontsLoaded) return <LoadingScreen />;

    console.log("Hot reload...");

    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <Toaster hapticFeedback />
        </SafeAreaProvider>
    );
}

export default function RootLayout() {
    return (
        <Suspense fallback={<ActivityIndicator size={"large"} />}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <RootContent />
            </GestureHandlerRootView>
        </Suspense>
    );
}

const fonts = {
    "sans-regular": require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
};

// Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, debug: __DEV__ });
// export default Sentry.wrap(RootLayout);
//  <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
//  <PostHogProvider client={posthog}>
//  </PostHogProvider>
//  </ClerkProvider>
