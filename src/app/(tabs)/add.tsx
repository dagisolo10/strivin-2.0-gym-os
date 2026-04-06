import { z } from "zod";
import { useRouter } from "expo-router";
import { exerciseSchema } from "@/db/zod";
import { useUser } from "@/hooks/use-user";
import { toast } from "react-native-sonner";
import { DAY_ORDER } from "@/constants/data";
import { addExercise } from "@/server/exercise";
import { ActivityIndicator } from "react-native";
import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/interactive";
import { HeroPill } from "@/components/add/hero-pill";
import { usePlanStore } from "@/store/use-plan-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { StatusChip } from "@/components/add/status-chip";
import { SectionTitle } from "@/components/add/section-title";
import { PlanCarousel } from "@/components/plans/plan-carousel";
import { ErrorToast } from "@/components/add/add-screen-components";
import { useForm, FieldErrors, FieldValues } from "react-hook-form";
import { Badge, Card, Div, H1, H2, P, Row, Screen } from "@/components/ui/display";
import { ExerciseNameField, TypeField, VariantField, DayAssignmentField, SetsAndRepsFields, DurationField, UnitAndValueField } from "@/components/exercise/exercise-form-fields";

type AddExerciseValues = z.infer<typeof exerciseSchema>;

export default function AddExerciseScreen() {
    const router = useRouter();
    const { user, isLoading } = useUser();
    const selectedPlanId = usePlanStore((state) => state.selectedPlanId);
    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);

    const plans = useMemo(() => user?.plans ?? [], [user?.plans]);
    const planIds = useMemo(() => plans.map((plan) => plan.localId).join("|"), [plans]);

    const { control, handleSubmit, watch, resetField, setValue, getValues } = useForm<AddExerciseValues>({
        resolver: zodResolver(exerciseSchema),
        defaultValues: { name: "", unit: "", type: "", variant: "", workoutDays: [] },
    });

    const selectedType = watch("type");
    const selectedUnit = watch("unit");
    const selectedDays = watch("workoutDays") ?? [];
    const selectedVariant = watch("variant");
    const exerciseName = watch("name");
    const isCardio = selectedType === "Cardio";

    useEffect(() => {
        if (!selectedType) return;

        if (isCardio) {
            resetField("sets");
            resetField("reps");
            resetField("weight");
            if (!["km", "mi"].includes(String(getValues("unit") ?? ""))) setValue("unit", "km");
        } else {
            resetField("duration");
            resetField("distance");
            if (!["kg", "lb"].includes(String(getValues("unit") ?? ""))) setValue("unit", "kg");
        }
    }, [getValues, isCardio, resetField, selectedType, setValue]);

    useEffect(() => {
        syncSelectedPlan(plans.map((plan) => plan.localId));
    }, [planIds, plans, syncSelectedPlan]);

    if (isLoading) {
        return (
            <Screen className="items-center justify-center">
                <ActivityIndicator size="large" />
            </Screen>
        );
    }

    if (!user) {
        return (
            <Screen className="items-center justify-center px-6">
                <P className="text-muted-foreground text-center">User not found.</P>
            </Screen>
        );
    }

    const plan = plans.find((item) => item.localId === selectedPlanId) ?? plans[0];
    if (!plan) {
        return (
            <Screen className="items-center justify-center px-6">
                <P className="text-muted-foreground text-center">Create a workout plan before adding exercises.</P>
            </Screen>
        );
    }

    const onInvalid = (errors: FieldErrors<FieldValues>) => {
        const errorEntries = Object.entries(errors).filter(([_, error]) => error?.message);
        toast.custom(<ErrorToast errorEntries={errorEntries} />, { duration: 20000 });
    };

    async function registerEx(data: AddExerciseValues) {
        const { workoutDays, ...exercises } = data;

        const payload = {
            userId: user?.localId ?? "user-1",
            planId: plan.localId,
            exercise: exercises as any,
            workoutDays: workoutDays as Weekday[],
        };

        try {
            const request = addExercise(payload).then((result) => {
                if (!result.success) throw new Error(String(result.error));
                return result;
            });

            toast.promise(request, {
                loading: "Adding Exercise...",
                success: "Exercise added",
                error: "Failed to add exercise",
            });

            await request;
            router.replace("/(tabs)/home");
        } catch (error) {
            console.error(error);
        }
    }

    const hasSelectedType = Boolean(selectedType);

    return (
        <Screen className="gap-6 pb-36">
            <H1>Add Exercise</H1>

            <Card variant="accent">
                <Row className="items-start gap-4">
                    <Row className="items-end">
                        <Div className="flex-1 gap-2">
                            <Badge variant="glass" className="self-start">
                                Exercise Studio
                            </Badge>
                            <H2 className="text-white">Build a polished training block</H2>
                        </Div>

                        <Div className="rounded-3xl bg-white/12 p-4">
                            <P className="text-xs tracking-[2px] text-white/70 uppercase">Assigned</P>
                            <P className="mt-1 text-2xl text-white">{selectedDays.length}</P>
                            <P className="text-sm text-white/75">days ready</P>
                        </Div>
                    </Row>
                </Row>
                <P className="text-white/75">Create a movement, shape its workload, and slot it into your weekly plan with a cleaner, coach-like structure.</P>
                <Row className="gap-3">
                    <HeroPill label="Plan" value={plan.split} />
                    <HeroPill label="Days" value={`${plan.workoutDaysPerWeek}/week`} />
                </Row>
            </Card>

            <PlanCarousel plans={plans} selectedPlanId={plan.localId} onSelect={setSelectedPlanId} title="Destination Plan" subtitle="Pick the plan that should receive this movement before you save it." />

            <Card className="gap-5">
                <Row className="items-start gap-3">
                    <Div className="flex-1">
                        <SectionTitle eyebrow="Identity" title="Describe the movement" note="Start with the name, category, and placement so the routine stays easy to scan later." />
                    </Div>
                    <StatusChip label="Type" value={selectedType || "Choose"} muted={!selectedType} />
                </Row>

                <ExerciseNameField control={control} />
                <TypeField control={control} />
                <VariantField control={control} />
                <DayAssignmentField control={control} />
            </Card>

            <Card className="gap-4">
                <Row>
                    <SectionTitle
                        eyebrow="Metrics"
                        title="Define the training target"
                        note={!hasSelectedType ? "Choose a type first to unlock the right workload fields." : isCardio ? "Use time and distance for conditioning work." : "Use sets, reps, and weight for strength work."}
                    />
                    <Badge variant={!hasSelectedType ? "outline" : isCardio ? "secondary" : "primary"}>+ {!hasSelectedType ? "Choose type" : isCardio ? "Endurance" : "Strength"}+ </Badge>
                </Row>
                {hasSelectedType ? isCardio ? <DurationField control={control} /> : <SetsAndRepsFields control={control} /> : null}
                {hasSelectedType ? <UnitAndValueField control={control} isCardio={isCardio} /> : null}
            </Card>

            <Card variant="muted">
                <SectionTitle eyebrow="Preview" title="Routine snapshot" note="A quick read on how this movement will present once it lands in the plan." />
                <Div className="bg-card gap-3 rounded-3xl">
                    <Row className="items-start">
                        <Div className="flex-1 gap-1">
                            <P className="text-base">{exerciseName?.trim() || "Unnamed movement"}</P>
                            <P className="text-muted-foreground text-sm">
                                {selectedType || "Type pending"} {selectedVariant ? ` •  ${selectedVariant}` : ""}
                            </P>
                        </Div>
                        <Badge variant={isCardio ? "secondary" : "outline"}>{selectedUnit || (isCardio ? "km" : "kg")}</Badge>
                    </Row>

                    <Div className="row flex-wrap justify-between gap-4">
                        {selectedDays.length ? (
                            [...selectedDays]
                                .sort((a, b) => DAY_ORDER[a as Weekday] - DAY_ORDER[b as Weekday])
                                .map((day: string) => (
                                    <Badge className="max-w-28 min-w-24 flex-1 p-1 px-2" key={day} variant="secondary">
                                        {day}
                                    </Badge>
                                ))
                        ) : (
                            <Badge variant="outline">Assign workout days</Badge>
                        )}
                    </Div>

                    <P className="text-muted-foreground text-sm">{isCardio ? "This will track distance and duration in the day logger." : "This will show target sets, reps, and weight guidance in the day logger."}</P>
                </Div>
            </Card>

            <Card className="items-start gap-3 border-0 bg-[#FFF1D6]">
                <Badge variant="outline">Coach note</Badge>
                <P className="text-muted-foreground">Use specific names like &quot;Incline Dumbbell Press&quot; or &quot;Treadmill Tempo Run&quot; so logging later feels immediate and precise.</P>
            </Card>

            <Button onPress={handleSubmit(registerEx, onInvalid)}>Add To Routine</Button>
        </Screen>
    );
}
