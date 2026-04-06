import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { useUser } from "@/hooks/use-user";
import { Alert, Image } from "react-native";
import { usePlanStore } from "@/store/use-plan-store";
import { useStaticStore } from "@/store/use-static-store";
import { Button, NavLink } from "@/components/ui/interactive";
import { PlanCarousel } from "@/components/plans/plan-carousel";
import { calculateStreak, resetLocalUserData } from "@/server/workout";
import { Card, Div, H1, H3, P, Row, Screen } from "@/components/ui/display";

export default function Settings() {
    const router = useRouter();
    const { user } = useUser();
    const selectedPlanId = usePlanStore((state) => state.selectedPlanId);
    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);
    const resetStore = useStaticStore((state) => state.resetToInitial);

    const plans = useMemo(() => user?.plans ?? [], [user?.plans]);
    const planIds = plans.map((plan) => plan.localId).join("|");
    useEffect(() => {
        syncSelectedPlan(plans.map((plan) => plan.localId));
    }, [planIds, plans, syncSelectedPlan]);

    const activePlan = plans.find((plan) => plan.localId === selectedPlanId) ?? plans[0];
    const streak = calculateStreak(user?.sessions ?? []);

    return (
        <Screen className="gap-6 pb-36">
            <Div className="gap-2">
                <H1>Settings</H1>
                <P className="text-muted-foreground">Manage your local-first workout data, demo profile, and plan setup.</P>
            </Div>

            <Card className="gap-3">
                <P className="text-muted-foreground text-sm uppercase">Dev Profile</P>
                <Row className="items-end">
                    <Row className="items-end gap-4">
                        <Image className="size-14 rounded-full" source={user?.profile ? { uri: user.profile } : require("../../../assets/images/profile.jpg")} />
                        <Div className="justify-start">
                            <H3>{user?.name}</H3>
                        </Div>
                    </Row>
                    <P className="text-muted-foreground text-sm">Current streak: {streak.current} days</P>
                </Row>
            </Card>

            <PlanCarousel plans={plans} selectedPlanId={activePlan?.localId ?? null} onSelect={setSelectedPlanId} title="Plan library" subtitle="Keep an eye on which plan is active before you edit or add new movements." />

            <Card className="gap-2">
                <P className="text-muted-foreground text-sm uppercase">Plan</P>
                <H3>{activePlan?.split ?? "No plan yet"}</H3>
                <P className="text-muted-foreground text-sm">{plans.length} saved plans on this device.</P>

                <NavLink href={"/plan-editor"} className="mt-2" variant={"outline"} size={"lg"}>
                    Edit selected plan
                </NavLink>
            </Card>

            <Card className="bg-destructive/20 border-destructive/50 gap-3">
                <P className="text-muted-foreground text-sm uppercase">Danger zone</P>
                <P className="text-muted-foreground">Resetting local data removes your saved plan, sessions, and streak history from this device.</P>
                <Button
                    variant="outline"
                    className="mt-2"
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
                    variant={"destructive"}
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
