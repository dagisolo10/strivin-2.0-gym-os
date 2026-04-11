import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { useAppData } from "@/hooks/use-app-data";
import { useRouter, useSegments } from "expo-router";
import StartupLoadingScreen from "@/components/ui/startup-loading-screen";

const STARTUP_MINIMUM_MS = 1000;

export default function Index() {
    const segments = useSegments();
    const { user, loading: userLoading } = useUser();
    const { enrichedPlans, isLoading: appDataLoading } = useAppData({ includePlanDetails: true });
    const [session, setSession] = useState<Session | null>(null);
    const [initialized, setInitialized] = useState(false);
    const [minimumStartupElapsed, setMinimumStartupElapsed] = useState(false);

    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setInitialized(true);
        });

        const { data } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));

        return () => data.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setMinimumStartupElapsed(true), STARTUP_MINIMUM_MS);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!initialized || userLoading || appDataLoading || !minimumStartupElapsed) return;

        const inAuthGroup = segments[0] === "(auth)";
        const inOnboarding = segments[0] === "onboarding";
        const hasActivePlan = enrichedPlans.length > 0;

        if (!session) {
            if (!inAuthGroup) router.replace("/(auth)/sign-up");
            return;
        }

        if (!user) {
            if (!inOnboarding) router.replace("/onboarding");
            return;
        }

        if (!hasActivePlan) {
            if (!inOnboarding) router.replace("/onboarding");
            return;
        }

        if (segments[0] !== "(tabs)") {
            router.replace("/(tabs)/home");
        }
    }, [initialized, minimumStartupElapsed, router, segments, session, user, userLoading, appDataLoading, enrichedPlans.length]);

    return <StartupLoadingScreen />;
}
