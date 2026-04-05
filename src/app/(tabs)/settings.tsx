import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { usePlanStore } from "@/store/use-plan-store";
import { useStaticStore } from "@/store/use-static-store";
import { PlanCarousel } from "@/components/plans/plan-carousel";
import { Badge, Card, Div, H1, P, Screen } from "@/components/ui/view";
import { calculateStreak, resetLocalUserData } from "@/server/workout";

export default function Settings() {
    const router = useRouter();
    const { user: localUser } = useUser();
    const selectedPlanId = usePlanStore((state) => state.selectedPlanId);
    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);
    const resetStore = useStaticStore((state) => state.resetToInitial);

    const plans = useMemo(() => localUser?.plans ?? [], [localUser?.plans]);
    const planIds = plans.map((plan) => plan.id).join("|");
    useEffect(() => {
        syncSelectedPlan(plans.map((plan) => plan.id));
    }, [planIds, plans, syncSelectedPlan]);

    const activePlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];
    const streak = calculateStreak(localUser?.sessions ?? []);

    return (
        <Screen className="gap-5 px-6 py-8">
            <Div className="gap-2">
                <Badge variant="outline">Profile & Local Data</Badge>
                <H1 className="text-3xl">Settings</H1>
                <P className="text-muted-foreground">Manage your local-first workout data, demo profile, and plan setup.</P>
            </Div>

            <Card className="gap-3 rounded-[28px] px-5 py-5">
                <P className="text-muted-foreground text-sm uppercase">Dev Profile</P>
                <P>Malcom@gmail.com</P>
                <P className="text-muted-foreground text-sm">Current streak: {streak.current} days</P>
            </Card>

            <PlanCarousel plans={plans} selectedPlanId={activePlan?.id ?? null} onSelect={setSelectedPlanId} title="Plan library" subtitle="Keep an eye on which plan is active before you edit or add new movements." />

            <Card className="gap-3 rounded-[28px] px-5 py-5">
                <P className="text-muted-foreground text-sm uppercase">Plan</P>
                <P>{activePlan?.split ?? "No plan yet"}</P>
                <P className="text-muted-foreground text-sm">{plans.length} saved plans on this device.</P>
                <Button variant="outline" className="mt-2 h-14 rounded-2xl" onPress={() => router.push("/plan-editor")}>
                    Edit selected plan
                </Button>
            </Card>

            <Card className="gap-3 rounded-[28px] px-5 py-5">
                <P className="text-muted-foreground text-sm uppercase">Danger zone</P>
                <P className="text-muted-foreground">Resetting local data removes your saved plan, sessions, and streak history from this device.</P>
                <Button
                    variant="outline"
                    className="mt-2 h-14 rounded-2xl"
                    onPress={() =>
                        Alert.alert("Reset local data", "This clears your on-device workout profile and history for the local dev account.", [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Reset",
                                style: "destructive",
                                onPress: async () => {
                                    await resetLocalUserData();
                                    router.replace("/onboarding");
                                },
                            },
                        ])
                    }>
                    Reset local data
                </Button>
                <Button
                    className="h-14 rounded-2xl"
                    onPress={async () => {
                        resetStore();
                        router.replace("/(tabs)/home");
                    }}>
                    Reload demo data
                </Button>
            </Card>
        </Screen>
    );
}
