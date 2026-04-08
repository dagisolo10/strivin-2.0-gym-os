import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAppData } from "@/hooks/use-app-data";
import { LoadingScreen } from "@/components/ui/screen-ui";

export default function Index() {
    const router = useRouter();
    const { user, plans, isLoading } = useAppData();

    useEffect(() => {
        if (isLoading) return;
        if (!user) return router.replace("/onboarding");

        const hasPlans = plans.length > 0;
        const destination = hasPlans ? "/(tabs)/home" : "/onboarding";

        router.replace(destination);
    }, [isLoading, plans, router, user]);

    return <LoadingScreen />;
}
