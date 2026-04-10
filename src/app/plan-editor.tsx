import { z } from "zod";
import { cn } from "@/lib/utils";
import { Alert } from "react-native";
import { usePlan } from "@/hooks/use-plan";
import { planEditorSchema } from "@/db/zod";
import { toast } from "react-native-sonner";
import { useAppData } from "@/hooks/use-app-data";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAuthStore } from "@/store/use-auth-store";
import { usePlanStore } from "@/store/use-plan-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PlanCarousel } from "@/components/plans/plan-carousel";
import { Button, Input, NavLink } from "@/components/ui/interactive";
import { deleteWorkoutPlan, saveWorkoutPlan, ExerciseInput } from "@/server/plan";
import { Badge, Card, Div, H1, H2, Label, P, Row, Screen } from "@/components/ui/display";
import { FITNESS_LEVELS, GOALS, SESSION_LENGTHS, weekdays, WORKOUT_SPLIT } from "@/constants/data";

type PlanEditorValues = z.infer<typeof planEditorSchema>;

export default function PlanEditorScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ mode?: string }>();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { enrichedPlans: plans, exercises } = useAppData({ includePlanDetails: true, includeWorkoutHistory: true });
    const localUserId = useAuthStore((state) => state.localUserId);
    const { activePlan } = usePlan();

    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);

    const isCreateMode = params.mode === "new";
    const selectedPlan = isCreateMode ? null : activePlan;

    const defaultWorkoutDays = useMemo(() => (selectedPlan?.days.map((day) => day.dayName) ?? ["Monday", "Wednesday", "Friday"]) as Weekday[], [selectedPlan?.days]);

    useEffect(() => {
        syncSelectedPlan(plans.map((plan) => plan.localId));
    }, [plans, syncSelectedPlan]);

    const methods = useForm<PlanEditorValues>({
        resolver: zodResolver(planEditorSchema),
        defaultValues: {
            split: selectedPlan?.split ?? "",
            workoutDays: defaultWorkoutDays,
            goal: selectedPlan?.goal ?? "Hypertrophy",
            sessionLength: 60,
            fitnessLevel: selectedPlan?.fitnessLevel ?? "Beginner",
        },
    });
    const resetForm = methods.reset;

    useEffect(() => {
        resetForm({
            split: selectedPlan?.split ?? "",
            workoutDays: defaultWorkoutDays,
            goal: selectedPlan?.goal ?? "Hypertrophy",
            sessionLength: 60,
            fitnessLevel: selectedPlan?.fitnessLevel ?? "Beginner",
        });
    }, [selectedPlan?.fitnessLevel, selectedPlan?.goal, selectedPlan?.split, defaultWorkoutDays, resetForm]);

    if (!localUserId) {
        return (
            <Screen className="items-center justify-center gap-4 px-6">
                <H2 className="text-center">Finish your setup to start building plans.</H2>
                <Button onPress={() => router.replace("/onboarding")}>Open onboarding</Button>
            </Screen>
        );
    }

    const exercisesForPlan: ExerciseInput[] = isCreateMode
        ? []
        : (selectedPlan?.days ?? []).flatMap((day) => {
              return exercises
                  .filter((exercise) => exercise.planId === selectedPlan?.localId && exercise.workoutDayId === day.localId)
                  .map((exercise) => ({
                      name: exercise.name,
                      workoutDays: [day.dayName],
                      unit: exercise.unit ?? undefined,
                      sets: exercise.sets ?? undefined,
                      reps: exercise.reps ?? undefined,
                      weight: exercise.weight ?? undefined,
                      distance: exercise.distance ?? undefined,
                      duration: exercise.duration ?? undefined,
                      type: exercise.type,
                      variant: exercise.variant,
                  }));
          });

    const savePlan = async (values: PlanEditorValues, createNew = false) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const request = saveWorkoutPlan({
                userId: localUserId,
                planId: createNew || isCreateMode ? undefined : selectedPlan?.localId,
                split: values.split as WorkoutSplit,
                workoutDays: values.workoutDays as Weekday[],
                goal: values.goal as Goal | undefined,
                sessionLength: values.sessionLength,
                fitnessLevel: values.fitnessLevel as FitnessLevel | undefined,
                exercises: exercisesForPlan as any,
            }).then((result) => {
                if (!result.success) throw new Error(result.error);
                return result;
            });

            const isCreating = createNew || isCreateMode;
            toast.promise(request, {
                loading: isCreating ? "Creating plan..." : "Saving plan...",
                success: isCreating ? "New plan created" : "Plan updated",
                error: isCreating ? "Could not create plan" : "Could not update plan",
            });

            const result = await request;
            if (result.success) {
                setSelectedPlanId(result.planId);
                router.back();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Screen className="gap-6">
            <H1>{isCreateMode ? "Create Plan" : "Plan Editor"}</H1>

            <Card variant={"accent"} className="items-start gap-4">
                <Div className="w-full gap-2">
                    <H2 className="text-white">{isCreateMode ? "Start a new training cycle" : "Shape your training library"}</H2>
                    <P className="max-w-[320px] text-white/85">
                        {isCreateMode
                            ? "Build a fresh plan from scratch, then add exercises once the structure is saved."
                            : "Edit the selected plan without jumping back into onboarding, or spin up a second version for a new phase."}
                    </P>
                </Div>
                <Row className="gap-3">
                    <EditorPill label="Saved plans" value={`${(plans ?? []).length}`} />
                    <EditorPill label="Active moves" value={`${selectedPlan?.days.reduce((sum: number, day: any) => sum + (day.exercises?.length ?? 0), 0) ?? 0}`} />
                </Row>
            </Card>

            {!isCreateMode ? (
                <PlanCarousel
                    plans={plans}
                    selectedPlanId={selectedPlan?.localId ?? null}
                    onSelect={setSelectedPlanId}
                    title="Plan carousel"
                    subtitle="Choose the plan you want to refine before making changes."
                />
            ) : null}

            <Card className="gap-5">
                <SectionTitle eyebrow="Structure" title="Plan identity" note="Set the split, goal, and cadence that define this cycle." />

                <Controller
                    control={methods.control}
                    name="split"
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <Div>
                            <Label>Split name</Label>
                            <Input className={error && "border-destructive"} value={value} onChangeText={onChange} placeholder="e.g. Upper Lower" />

                            <Div className="row mt-4 flex-wrap gap-2">
                                {WORKOUT_SPLIT.map((preset) => (
                                    <Button
                                        key={preset}
                                        variant={value === preset ? "secondary" : "outline"}
                                        className="min-w-36 flex-1 px-4"
                                        textClassName={value === preset ? "text-background" : "text-muted-foreground"}
                                        onPress={() => onChange(preset)}>
                                        {preset}
                                    </Button>
                                ))}
                            </Div>
                        </Div>
                    )}
                />

                <Controller
                    control={methods.control}
                    name="workoutDays"
                    render={({ field: { value = [], onChange }, fieldState: { error } }) => (
                        <Div className="gap-3">
                            <P className="text-sm">Workout days</P>
                            <Div className="row flex-wrap gap-2">
                                {weekdays.map((day) => {
                                    const selected = value.includes(day);
                                    return (
                                        <Button
                                            key={day}
                                            variant={selected ? "secondary" : "outline"}
                                            className={cn(error && "border-destructive", "min-w-28 flex-1 px-4")}
                                            textClassName={selected ? "text-background" : "text-muted-foreground"}
                                            onPress={() => onChange(selected ? value.filter((item) => item !== day) : [...value, day])}>
                                            {day}
                                        </Button>
                                    );
                                })}
                            </Div>
                        </Div>
                    )}
                />
            </Card>

            <Card className="gap-5">
                <SectionTitle eyebrow="Performance" title="Training profile" note="Tune the intent of the plan so the rest of the app presents the right cues." />

                <Controller
                    control={methods.control}
                    name="goal"
                    render={({ field: { value, onChange } }) => (
                        <Div className="gap-3">
                            <P className="text-sm">Primary goal</P>
                            <Div className="row flex-wrap gap-2">
                                {GOALS.map((goal) => (
                                    <Button
                                        key={goal.label}
                                        variant={value === goal.label ? "secondary" : "outline"}
                                        className="min-w-36 flex-1 px-4"
                                        textClassName={value === goal.label ? "text-background" : "text-muted-foreground"}
                                        onPress={() => onChange(goal.label)}>
                                        {goal.label}
                                    </Button>
                                ))}
                            </Div>
                        </Div>
                    )}
                />

                <Controller
                    control={methods.control}
                    name="sessionLength"
                    render={({ field: { value, onChange } }) => (
                        <Div className="gap-3">
                            <P className="text-sm">Session length</P>
                            <Div className="row flex-wrap gap-2">
                                {SESSION_LENGTHS.map((length) => (
                                    <Button
                                        key={length}
                                        variant={value === length ? "secondary" : "outline"}
                                        className="min-w-36 flex-1 px-4"
                                        textClassName={value === length ? "text-background" : "text-muted-foreground"}
                                        onPress={() => onChange(length)}>
                                        {length} min
                                    </Button>
                                ))}
                            </Div>
                        </Div>
                    )}
                />

                <Controller
                    control={methods.control}
                    name="fitnessLevel"
                    render={({ field: { value, onChange } }) => (
                        <Div className="gap-3">
                            <P className="text-sm">Fitness level</P>
                            <Div className="row flex-wrap gap-2">
                                {FITNESS_LEVELS.map((level) => (
                                    <Button
                                        key={level}
                                        variant={value === level ? "secondary" : "outline"}
                                        className="flex-1 px-2"
                                        textClassName={value === level ? "text-background" : "text-muted-foreground"}
                                        onPress={() => onChange(level)}>
                                        {level}
                                    </Button>
                                ))}
                            </Div>
                        </Div>
                    )}
                />
            </Card>

            <Card className="gap-3">
                <SectionTitle
                    eyebrow="Next step"
                    title="Exercise management"
                    note={
                        isCreateMode
                            ? "Save the plan first, then use the Add screen to build out the movement library."
                            : "This editor handles plan structure. Use the Add screen to create or expand the movement library for the active plan."
                    }
                />

                {!isCreateMode ? (
                    <NavLink href={"/(tabs)/add"} variant={"outline"}>
                        Open Add Screen
                    </NavLink>
                ) : null}
            </Card>

            <Button onPress={methods.handleSubmit((values) => savePlan(values, false))} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isCreateMode ? "Create Plan" : "Save Changes"}
            </Button>

            {!isCreateMode ? (
                <Button variant="outline" onPress={methods.handleSubmit((values) => savePlan(values, true))} disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save As New Plan"}
                </Button>
            ) : null}

            {selectedPlan && plans.length > 1 ? (
                <Button
                    variant="destructive"
                    onPress={() =>
                        Alert.alert("Delete plan", "This removes the selected plan and its exercises from this device.", [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Delete",
                                style: "destructive",
                                onPress: async () => {
                                    if (isDeleting) return;
                                    setIsDeleting(true);
                                    const result = await deleteWorkoutPlan(localUserId, selectedPlan.localId);
                                    if (!result.success) {
                                        toast.error("Could not delete plan");
                                        setIsDeleting(false);
                                        return;
                                    }
                                    toast.success("Plan deleted");
                                    setIsDeleting(false);
                                    router.back();
                                },
                            },
                        ])
                    }>
                    {isDeleting ? "Deleting..." : "Delete Selected Plan"}
                </Button>
            ) : null}
        </Screen>
    );
}

function EditorPill({ label, value }: { label: string; value: string }) {
    return (
        <Card className="flex-1 border-0">
            <P className="text-xs text-white/75 uppercase">{label}</P>
            <P className="mt-1 text-xl text-white">{value}</P>
        </Card>
    );
}

function SectionTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
    return (
        <Div className="gap-1">
            <Badge className="self-end" variant="outline">
                {eyebrow}
            </Badge>
            <H2 className="text-2xl">{title}</H2>
            <P className="text-muted-foreground text-sm">{note}</P>
        </Div>
    );
}
