import { z } from "zod";
import { useRouter } from "expo-router";
import { exerciseSchema } from "@/db/zod";
import { toast } from "react-native-sonner";
import { DAY_ORDER } from "@/constants/data";
import { addExercise } from "@/server/exercise";
import { useAppData } from "@/hooks/use-app-data";
import { Button } from "@/components/ui/interactive";
import { HeroPill } from "@/components/add/hero-pill";
import { usePlanStore } from "@/store/use-plan-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { StatusChip } from "@/components/add/status-chip";
import React, { useEffect, useRef, useState } from "react";
import { SectionTitle } from "@/components/add/section-title";
import { PlanCarousel } from "@/components/plans/plan-carousel";
import { ErrorToast } from "@/components/add/add-screen-components";
import { useForm, FieldErrors, FieldValues } from "react-hook-form";
import { ErrorScreen, LoadingScreen } from "@/components/ui/screen-ui";
import { Badge, Card, Div, H1, H2, P, Row, Screen } from "@/components/ui/display";
import {
    ExerciseNameField,
    TypeField,
    VariantField,
    DayAssignmentField,
    SetsAndRepsFields,
    DurationField,
    UnitAndValueField,
    CoreWeightToggleField,
} from "@/components/exercise/exercise-form-fields";

type AddExerciseValues = z.input<typeof exerciseSchema>;

export default function AddExerciseScreen() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, enrichedPlans, isLoading } = useAppData({ includePlanDetails: true, includeWorkoutHistory: true });
    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);
    const selectedPlanId = usePlanStore((state) => state.selectedPlanId);
    const activePlan = enrichedPlans.find((plan) => plan.localId === selectedPlanId) ?? enrichedPlans[0] ?? null;

    useEffect(() => {
        if (enrichedPlans) syncSelectedPlan(enrichedPlans.map((plan) => plan.localId));
    }, [enrichedPlans, syncSelectedPlan]);

    const { control, handleSubmit, watch, resetField, setValue, getValues, reset } = useForm<AddExerciseValues>({
        resolver: zodResolver(exerciseSchema),
        defaultValues: { name: "", unit: "", type: "", variant: "", workoutDays: [], usesWeight: true },
    });

    const selectedType = watch("type");
    const selectedUnit = watch("unit");
    const selectedDays = watch("workoutDays") ?? [];
    const selectedVariant = watch("variant");
    const exerciseName = watch("name");
    const usesWeight = watch("usesWeight") ?? (selectedType === "Cardio" || selectedType === "Core" ? false : true);
    const hasSelectedType = Boolean(selectedType);
    const previousTypeRef = useRef<string>("");

    const isCardio = selectedType === "Cardio";
    const isCore = selectedType === "Core";
    const isBodyweight = !isCardio && !usesWeight;

    useEffect(() => {
        if (selectedType === "Core" && previousTypeRef.current !== "Core") {
            setValue("usesWeight", false);
        }
        previousTypeRef.current = selectedType ?? "";
    }, [selectedType, setValue]);

    useEffect(() => {
        if (!selectedType) return;

        if (isCardio) {
            resetField("sets");
            resetField("reps");
            resetField("weight");
            setValue("usesWeight", false);
            if (!["km", "mi"].includes(String(getValues("unit") ?? ""))) setValue("unit", "km");
        } else {
            resetField("duration");
            resetField("distance");
            if (selectedType !== "Core") {
                setValue("usesWeight", true);
            }
            if ((selectedType !== "Core" || usesWeight) && !["kg", "lb"].includes(String(getValues("unit") ?? ""))) {
                setValue("unit", "kg");
            }
            if (selectedType === "Core" && !usesWeight) {
                resetField("weight");
                resetField("unit");
            }
        }
    }, [getValues, isCardio, resetField, selectedType, setValue, usesWeight]);

    if (isLoading) return <LoadingScreen />;
    if (!user) return <ErrorScreen message="User not found." />;
    if (!activePlan) return <ErrorScreen message="Create a workout plan before adding exercises." />;

    const onInvalid = (errors: FieldErrors<FieldValues>) => {
        const errorEntries = Object.entries(errors).filter(([_, error]) => error?.message);
        toast.custom(<ErrorToast errorEntries={errorEntries} />, { duration: 20000 });
    };

    async function registerEx(data: AddExerciseValues) {
        if (isSubmitting) return;
        const { workoutDays, ...exercises } = data;

        if (!user) return;

        const payload = {
            userId: user?.localId,
            planId: activePlan.localId,
            exercise: exercises as any,
            workoutDays: workoutDays as Weekday[],
        };

        try {
            setIsSubmitting(true);
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
            reset({ name: "", unit: "", type: "", variant: "", workoutDays: [], usesWeight: true });
            router.replace("/(tabs)/home");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }

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
                    <HeroPill label="Plan" value={activePlan.split} />
                    <HeroPill label="Days" value={`${activePlan.days?.length ?? 0}/week`} />
                </Row>
            </Card>

            <PlanCarousel
                plans={enrichedPlans as any}
                selectedPlanId={activePlan.localId}
                onSelect={setSelectedPlanId}
                title="Destination Plan"
                subtitle="Pick the plan that should receive this movement before you save it."
            />

            <Card className="gap-5">
                <Row className="items-start gap-3">
                    <Div className="flex-1">
                        <SectionTitle
                            eyebrow="Identity"
                            title="Describe the movement"
                            note="Start with the name, category, and placement so the routine stays easy to scan later."
                        />
                    </Div>
                    <StatusChip label="Type" value={selectedType || "Choose"} muted={!selectedType} />
                </Row>

                <ExerciseNameField control={control} />
                <TypeField control={control} />
                <VariantField control={control} />
                <DayAssignmentField control={control} />
            </Card>

            <Card className="gap-4">
                <Row className="items-start">
                    <SectionTitle
                        eyebrow="Metrics"
                        title="Define the training target"
                        note={
                            !hasSelectedType
                                ? "Choose a type first to unlock the right workload fields."
                                : isCardio
                                  ? "Use time and distance for conditioning work."
                                  : "Use sets, reps, and weight for strength work."
                        }
                    />
                </Row>
                <Badge className="self-start" variant={!hasSelectedType ? "outline" : isCardio ? "secondary" : "primary"}>
                    + {!hasSelectedType ? "Choose type" : isCardio ? "Endurance" : "Strength"}+{" "}
                </Badge>
                {hasSelectedType ? isCardio ? <DurationField control={control} /> : <SetsAndRepsFields control={control} /> : null}
                {isCore ? <CoreWeightToggleField control={control} /> : null}
                {hasSelectedType ? <UnitAndValueField control={control} isCardio={isCardio} showWeight={!isBodyweight} /> : null}
            </Card>

            <Card variant="muted" className="gap-4">
                <SectionTitle eyebrow="Preview" title="Routine snapshot" note="A quick read on how this movement will present once it lands in the plan." />
                <Div className="gap-3 rounded-3xl">
                    <Row className="items-start">
                        <Div className="flex-1 gap-1">
                            <P className="text-base">{exerciseName?.trim() || "Unnamed movement"}</P>
                            <P className="text-muted-foreground text-sm">
                                {selectedType || "Type pending"} {selectedVariant ? ` •  ${selectedVariant}` : ""}
                            </P>
                        </Div>
                        <Badge variant={isCardio ? "secondary" : "outline"}>{isBodyweight ? "Bodyweight" : selectedUnit || (isCardio ? "km" : "kg")}</Badge>
                    </Row>

                    <Div className="row flex-wrap gap-4">
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

                    <P className="text-muted-foreground text-sm">
                        {isCardio
                            ? "This will track distance and duration in the day logger."
                            : isCore && !usesWeight
                              ? "This will show sets and reps without requiring a weight target in the day logger."
                              : "This will show target sets, reps, and weight guidance in the day logger."}
                    </P>
                </Div>
            </Card>

            <Card className="items-start gap-3 border-0 bg-[#FFF1D6]">
                <Badge variant="outline">Coach note</Badge>
                <P className="text-muted-foreground">
                    Use specific names like &quot;Incline Dumbbell Press&quot; or &quot;Treadmill Tempo Run&quot; so logging later feels immediate and precise.
                </P>
            </Card>

            <Button onPress={handleSubmit(registerEx, onInvalid)} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add To Routine"}
            </Button>
        </Screen>
    );
}
