import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { useAppData } from "@/hooks/use-app-data";
import { useRouter, useSegments } from "expo-router";
import { LoadingScreen } from "@/components/ui/screen-ui";

export default function Index() {
    const [session, setSession] = useState<Session | null>(null);
    const [initialized, setInitialized] = useState(false);
    const segments = useSegments();
    const { user, loading: userLoading } = useUser();

    const router = useRouter();
    const { plans, isLoading } = useAppData();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setInitialized(true);
        });

        const { data } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));

        return () => data.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!initialized || isLoading || userLoading) return;

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
        const hasPlans = plans.length > 0;
        const destination = hasPlans ? "/(tabs)/home" : "/onboarding";

        router.replace(destination);
    }, [initialized, isLoading, plans.length, router, segments, session, user, userLoading]);

    return <LoadingScreen />;
}
