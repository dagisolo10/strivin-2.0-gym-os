import { useRouter } from "expo-router";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";
import { useAppData } from "@/hooks/use-app-data";
import StartupLoadingScreen from "@/components/ui/startup-loading-screen";

export default function Index() {
    const { user, loading, session: userSession, authInitialized } = useUser();
    const { enrichedPlans, isLoading } = useAppData({ includePlanDetails: true });

    const [minimumStartupElapsed, setMinimumStartupElapsed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => setMinimumStartupElapsed(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!authInitialized || loading || isLoading || !minimumStartupElapsed) return;

        const needsOnboarding = !user || enrichedPlans.length === 0;

        if (!userSession) router.replace("/(auth)/sign-in");
        else if (needsOnboarding) router.replace("/onboarding");
        else router.replace("/(tabs)/home");
    }, [authInitialized, enrichedPlans.length, isLoading, loading, minimumStartupElapsed, router, userSession, user]);

    return <StartupLoadingScreen />;
}
