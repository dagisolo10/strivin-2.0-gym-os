import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { useRouter, useSegments } from "expo-router";
import StartupLoadingScreen from "@/components/ui/startup-loading-screen";

export default function Index() {
    const [session, setSession] = useState<Session | null>(null);
    const [initialized, setInitialized] = useState(false);
    const [minimumStartupElapsed, setMinimumStartupElapsed] = useState(false);
    const segments = useSegments();
    const { user, loading: userLoading } = useUser();

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
        const timer = setTimeout(() => setMinimumStartupElapsed(true), 300);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!initialized || userLoading || !minimumStartupElapsed) return;

        const inAuthGroup = segments[0] === "(auth)";
        const inOnboarding = segments[0] === "onboarding";

        if (!session) {
            if (!inAuthGroup) router.replace("/(auth)/sign-up");
            return;
        }

        if (!user) {
            if (!inOnboarding) router.replace("/onboarding");
            return;
        }

        if (segments[0] !== "(tabs)") {
            router.replace("/(tabs)/home");
        }
    }, [initialized, minimumStartupElapsed, router, segments, session, user, userLoading]);

    return <StartupLoadingScreen />;
}
