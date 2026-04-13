import { z } from "zod";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Edit } from "lucide-react-native"; // Assuming you use Lucide
import { updateUser } from "@/server/user";
import { usePlan } from "@/hooks/use-plan";
import { useSync } from "@/hooks/use-sync";
import { useUser } from "@/hooks/use-user";
import { Alert, Image } from "react-native";
import { toast } from "react-native-sonner";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useAppData } from "@/hooks/use-app-data";
import { resetLocalUserData } from "@/server/workout";
import { useAuthStore } from "@/store/use-auth-store";
import { useForm, Controller } from "react-hook-form";
import { usePlanStore } from "@/store/use-plan-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlanCarousel } from "@/components/plans/plan-carousel";
import ManualSyncButton from "@/components/settings/sync-button";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { Button, Input, NavLink } from "@/components/ui/interactive";
import { LoadingScreen, ErrorMessage } from "@/components/ui/screen-ui";
import { Card, Div, H1, H3, P, Row, Screen, Field } from "@/components/ui/display";

// Assuming you use Lucide

const updateUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

type UpdateUserForm = z.infer<typeof updateUserSchema>;

export default function Settings() {
    const router = useRouter();
    const [isResetting, setIsResetting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const { user, enrichedPlans } = useAppData({ includePlanDetails: true, includeWorkoutHistory: true });
    const { activePlan } = usePlan();
    const { session, loading } = useUser();
    const localUserId = useAuthStore((state) => state.localUserId);

    const { isSyncing, forceSync, lastSyncTime, lastError } = useSync({ enabled: true });

    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);
    const resetOnboarding = useOnboardingStore((state) => state.reset);

    const form = useForm<UpdateUserForm>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            name: user?.name || "",
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({ name: user.name || "" });
        }
    }, [form, user]);

    const onSubmit = async (data: UpdateUserForm) => {
        if (isUpdating) return;

        if (!localUserId) {
            toast.error("User not found", { description: "Please sign in again." });
            return;
        }

        setIsUpdating(true);

        try {
            const updateData: { name?: string } = {};
            if (data.name !== user?.name) updateData.name = data.name;

            if (Object.keys(updateData).length === 0) {
                toast.success("No changes to update");
                return;
            }

            await updateUser(localUserId, updateData);
            toast.success("Profile updated successfully", { description: "Your changes have been saved." });
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to update profile", { description: error.message || "Please try again." });
        } finally {
            setIsUpdating(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            toast.error("Permission denied", { description: "We need access to your photos to update your profile picture." });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            try {
                await updateUser(localUserId!, { profile: uri });
                toast.success("Profile picture updated", { description: "Your new profile picture has been saved." });
            } catch (error: any) {
                console.error(error);
                toast.error("Failed to update profile picture", { description: error.message || "Please try again." });
            }
        }
    };

    const planIds = (enrichedPlans ?? []).map((plan) => plan.localId).join("|");
    useEffect(() => {
        if (enrichedPlans) syncSelectedPlan(enrichedPlans.map((plan) => plan.localId));
    }, [planIds, enrichedPlans, syncSelectedPlan]);

    if (loading) return <LoadingScreen />;

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
                        <Div className="relative">
                            <Image className="size-14 rounded-full" source={user?.profile ? { uri: user.profile } : require("../../../assets/images/images.png")} />
                            <Button className="absolute -right-1 -bottom-1 size-6 rounded-full p-0" variant="secondary" onPress={pickImage}>
                                <Edit size={12} color="white" />
                            </Button>
                        </Div>
                        <Div className="justify-start">
                            <H3>{user?.name}</H3>
                            <P className="text-muted-foreground">{session?.user.email}</P>
                        </Div>
                    </Row>
                </Row>

                <Div className="gap-4">
                    <Controller
                        control={form.control}
                        name="name"
                        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                            <Field label="Name">
                                <Input placeholder="Enter your name" value={value} onBlur={onBlur} onChangeText={onChange} />
                                <ErrorMessage message={error?.message} />
                            </Field>
                        )}
                    />
                    <Button variant="primary" disabled={isUpdating} onPress={form.handleSubmit(onSubmit)}>
                        {isUpdating ? "Updating..." : "Update Profile"}
                    </Button>
                </Div>
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

            <ManualSyncButton forceSync={forceSync} isSyncing={isSyncing} lastSyncTime={lastSyncTime} lastError={lastError} />

            <Button
                onPress={async () => {
                    await supabase.auth.signOut();
                    resetOnboarding();
                    useAuthStore.getState().clearAuth();
                    router.replace("/(auth)/sign-in");
                }}>
                Logout
            </Button>
        </Screen>
    );
}
