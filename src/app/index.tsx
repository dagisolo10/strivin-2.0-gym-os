import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@/hooks/use-user";
import { LoadingScreen } from "@/components/ui/screen-ui";

export default function Index() {
    const router = useRouter();
    const { user, isLoading } = useUser();

    useEffect(() => {
        if (isLoading) return;

        if (!user) return router.replace("/onboarding");

        const hasPlans = user.plans && user.plans.length > 0;
        const destination = hasPlans ? "/(tabs)/home" : "/onboarding";

        router.replace(destination);
    }, [isLoading, router, user, user?.plans.length]);

    return <LoadingScreen />;
}
