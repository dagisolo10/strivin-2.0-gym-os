import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { usePlan } from "@/hooks/use-plan";
import { useUser } from "@/hooks/use-user";
import { Alert, Image } from "react-native";
import { useEffect, useState } from "react";
import { useAppData } from "@/hooks/use-app-data";
import { resetLocalUserData } from "@/server/workout";
import { useAuthStore } from "@/store/use-auth-store";
import { usePlanStore } from "@/store/use-plan-store";
import { Button, NavLink } from "@/components/ui/interactive";
import { PlanCarousel } from "@/components/plans/plan-carousel";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { Card, Div, H1, H3, P, Row, Screen } from "@/components/ui/display";

export default function Settings() {
    const router = useRouter();
    const [isResetting, setIsResetting] = useState(false);
    const { user, enrichedPlans } = useAppData({ includePlanDetails: true, includeWorkoutHistory: true });
    const { activePlan } = usePlan();
    const { session } = useUser();
    const localUserId = useAuthStore((state) => state.localUserId);

    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);
    const resetOnboarding = useOnboardingStore((state) => state.reset);

    const planIds = (enrichedPlans ?? []).map((plan) => plan.localId).join("|");
    useEffect(() => {
        if (enrichedPlans) syncSelectedPlan(enrichedPlans.map((plan) => plan.localId));
    }, [planIds, enrichedPlans, syncSelectedPlan]);

    return (
        <Screen className="gap-6 pb-36">
            <Div className="gap-2">
                <H1>Settings</H1>
                <P className="text-muted-foreground">Manage your local-first workout data, demo profile, and plan setup.</P>
            </Div>

            <Card className="gap-3">
                <P className="text-muted-foreground text-sm uppercase">Dev Profile</P>
                <Row className="items-start">
                    <Row className="items-end gap-4">
                        <Image className="size-14 rounded-full" source={user?.profile ? { uri: user.profile } : require("../../../assets/images/profile.jpg")} />
                        <Div className="justify-start">
                            <H3>{user?.name}</H3>
                            <P className="text-muted-foreground">{session?.user.email}</P>
                        </Div>
                    </Row>
                    <P className="text-muted-foreground text-sm">
                        Current streak: {user?.currentStreak ?? 0} day{(user?.currentStreak ?? 0) > 1 ? "s" : ""}
                    </P>
                </Row>
            </Card>

            <PlanCarousel
                plans={enrichedPlans as any}
                selectedPlanId={activePlan?.localId ?? null}
                onSelect={setSelectedPlanId}
                title="Plan library"
                subtitle="Keep an eye on which plan is active before you edit or add new movements."
            />

            <Card className="gap-2">
                <P className="text-muted-foreground text-sm uppercase">Plan</P>
                <H3>{activePlan?.split ?? "No plan yet"}</H3>
                <P className="text-muted-foreground text-sm">{(enrichedPlans ?? []).length} saved plans on this device.</P>

                <NavLink href={{ pathname: "/plan-editor", params: { mode: "new" } }} className="mt-2" variant={"secondary"} size={"lg"}>
                    Create new plan
                </NavLink>
                <NavLink href={"/plan-editor"} className="mt-2" variant={"outline"} size={"lg"}>
                    Edit selected plan
                </NavLink>
            </Card>

            <Card className="bg-destructive/20 border-destructive/50 gap-3">
                <P className="text-muted-foreground text-sm uppercase">Danger zone</P>
                <P className="text-muted-foreground">Resetting local data removes your saved plan, sessions, and streak history from this device.</P>
                <Button
                    variant="destructive"
                    className="mt-2"
                    disabled={isResetting}
                    onPress={() =>
                        Alert.alert("Reset local data", "This clears your on-device workout profile and history for the local dev account.", [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Reset",
                                style: "destructive",
                                onPress: async () => {
                                    if (isResetting) return;
                                    setIsResetting(true);
                                    try {
                                        await resetLocalUserData(localUserId!);
                                        router.replace("/onboarding");
                                    } finally {
                                        setIsResetting(false);
                                    }
                                },
                            },
                        ])
                    }>
                    {isResetting ? "Resetting..." : "Reset local data"}
                </Button>
            </Card>

            <Button
                onPress={async () => {
                    await supabase.auth.signOut();
                    resetOnboarding();
                    router.replace("/(auth)/sign-in");
                }}>
                Logout
            </Button>
        </Screen>
    );
}
