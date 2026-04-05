import { z } from "zod";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { useUser } from "@/hooks/use-user";
import { toast } from "react-native-sonner";
import { weekdays } from "@/constants/data";
import { Controller, useForm } from "react-hook-form";
import { usePlanStore } from "@/store/use-plan-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/ui/button";
import { PlanCarousel } from "@/components/plans/plan-carousel";
import { Badge, Card, Div, H1, H2, P, Row, Screen } from "@/components/ui/view";
import { deleteWorkoutPlan, saveWorkoutPlan, ExerciseInput } from "@/server/plan";

const planEditorSchema = z.object({
    split: z.string().trim().min(1, "Split name is required"),
    workoutDays: z.array(z.string()).min(1, "Choose at least one workout day"),
    goal: z.string().optional(),
    sessionLength: z.number().min(15).max(180).optional(),
    fitnessLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
});

type PlanEditorValues = z.infer<typeof planEditorSchema>;

const splitPresets = ["Push Pull Leg", "Upper Lower", "Full Body", "Bro Split", "Hybrid"];
const goalPresets: Goal[] = ["Hypertrophy", "Strength", "Endurance"];
const lengthPresets = [45, 60, 75, 90];
const levelPresets: FitnessLevel[] = ["Beginner", "Intermediate", "Advanced"];

export default function PlanEditorScreen() {
    const router = useRouter();
    const { user } = useUser();
    const selectedPlanId = usePlanStore((state) => state.selectedPlanId);
    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);

    const plans = useMemo(() => user?.plans ?? [], [user?.plans]);
    const planIds = plans.map((plan) => plan.id).join("|");

    useEffect(() => {
        syncSelectedPlan(plans.map((plan) => plan.id));
    }, [planIds, plans, syncSelectedPlan]);

    const activePlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];

    const methods = useForm<PlanEditorValues>({
        resolver: zodResolver(planEditorSchema),
        defaultValues: {
            split: activePlan?.split ?? "Push Pull Leg",
            workoutDays: activePlan?.days.map((day) => day.dayName) ?? ["Monday", "Wednesday", "Friday"],
            goal: activePlan?.goal ?? "Hypertrophy",
            sessionLength: 60,
            fitnessLevel: activePlan?.fitnessLevel ?? "Beginner",
        },
    });
    const resetForm = methods.reset;

    useEffect(() => {
        resetForm({
            split: activePlan?.split ?? "Push Pull Leg",
            workoutDays: activePlan?.days.map((day) => day.dayName) ?? ["Monday", "Wednesday", "Friday"],
            goal: activePlan?.goal ?? "Hypertrophy",
            sessionLength: 60,
            fitnessLevel: activePlan?.fitnessLevel ?? "Beginner",
        });
    }, [activePlan, resetForm]);

    if (!user) {
        return (
            <Screen className="items-center justify-center gap-4 px-6">
                <H2 className="text-center">Finish your setup to start building plans.</H2>
                <Button className="h-14 rounded-2xl" onPress={() => router.replace("/onboarding")}>
                    Open onboarding
                </Button>
            </Screen>
        );
    }

    const exercisesForPlan: ExerciseInput[] =
        activePlan?.days.flatMap((day) =>
            day.exercises.map((exercise) => ({
                name: exercise.name,
                workoutDays: [day.dayName],
                unit: exercise.unit,
                sets: exercise.sets ?? undefined,
                reps: exercise.reps ?? undefined,
                weight: exercise.weight ?? undefined,
                distance: exercise.distance ?? undefined,
                duration: exercise.duration ?? undefined,
                type: exercise.type,
                variant: exercise.variant,
            })),
        ) ?? [];

    const savePlan = async (values: PlanEditorValues, createNew = false) => {
        const request = saveWorkoutPlan({
            userId: user.id,
            planId: createNew ? undefined : activePlan?.id,
            split: values.split as WorkoutSplit,
            workoutDays: values.workoutDays as Weekday[],
            goal: values.goal as Goal | undefined,
            sessionLength: values.sessionLength,
            fitnessLevel: values.fitnessLevel as FitnessLevel | undefined,
            exercises: exercisesForPlan,
        }).then((result) => {
            if (!result.success) throw new Error(result.error);
            return result;
        });

        toast.promise(request, {
            loading: createNew ? "Creating plan..." : "Saving plan...",
            success: createNew ? "New plan created" : "Plan updated",
            error: createNew ? "Could not create plan" : "Could not update plan",
        });

        const result = await request;
        if (result.success) setSelectedPlanId(result.planId);
        router.back();
    };

    return (
        <Screen className="px-6 py-8">
            <Div className="gap-6 pb-24">
                <Card className="bg-accent gap-4 rounded-4xl border-0 px-6 py-6">
                    <Badge variant="glass">Plan Editor</Badge>
                    <Div className="gap-2">
                        <H1 className="text-3xl text-white">Shape your training library</H1>
                        <P className="max-w-[320px] text-white/85">Edit the selected plan without jumping back into onboarding, or spin up a second version for a new phase.</P>
                    </Div>
                    <Row className="gap-3">
                        <EditorPill label="Saved plans" value={`${plans.length}`} />
                        <EditorPill label="Active moves" value={`${activePlan?.days.reduce((sum, day) => sum + day.exercises.length, 0) ?? 0}`} />
                    </Row>
                </Card>

                <PlanCarousel plans={plans} selectedPlanId={activePlan?.id ?? null} onSelect={setSelectedPlanId} title="Plan carousel" subtitle="Choose the plan you want to refine before making changes." />

                <Card className="bg-background gap-5 rounded-[28px] border-0 px-5 py-5">
                    <SectionTitle eyebrow="Structure" title="Plan identity" note="Set the split, goal, and cadence that define this cycle." />

                    <Controller
                        control={methods.control}
                        name="split"
                        render={({ field: { value, onChange }, fieldState: { error } }) => (
                            <Div className="gap-3">
                                <P className="text-sm">Split name</P>
                                <Input className={error ? "border-destructive h-14 rounded-2xl" : "h-14 rounded-2xl"} value={value} onChangeText={onChange} placeholder="e.g. Upper Lower" />
                                <Div className="row flex-wrap gap-2">
                                    {splitPresets.map((preset) => (
                                        <Button
                                            key={preset}
                                            variant={value === preset ? "secondary" : "outline"}
                                            className="rounded-2xl px-4"
                                            textClassName={value === preset ? "text-foreground" : "text-muted-foreground"}
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
                                                className={error ? "border-destructive rounded-2xl px-4" : "rounded-2xl px-4"}
                                                textClassName={selected ? "text-foreground" : "text-muted-foreground"}
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

                <Card className="bg-muted/50 gap-5 rounded-[28px] border-0 px-5 py-5">
                    <SectionTitle eyebrow="Performance" title="Training profile" note="Tune the intent of the plan so the rest of the app presents the right cues." />

                    <Controller
                        control={methods.control}
                        name="goal"
                        render={({ field: { value, onChange } }) => (
                            <Div className="gap-3">
                                <P className="text-sm">Primary goal</P>
                                <Div className="row flex-wrap gap-2">
                                    {goalPresets.map((goal) => (
                                        <Button key={goal} variant={value === goal ? "secondary" : "outline"} className="rounded-2xl px-4" textClassName={value === goal ? "text-foreground" : "text-muted-foreground"} onPress={() => onChange(goal)}>
                                            {goal}
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
                                    {lengthPresets.map((length) => (
                                        <Button
                                            key={length}
                                            variant={value === length ? "secondary" : "outline"}
                                            className="rounded-2xl px-4"
                                            textClassName={value === length ? "text-foreground" : "text-muted-foreground"}
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
                                    {levelPresets.map((level) => (
                                        <Button
                                            key={level}
                                            variant={value === level ? "secondary" : "outline"}
                                            className="rounded-2xl px-4"
                                            textClassName={value === level ? "text-foreground" : "text-muted-foreground"}
                                            onPress={() => onChange(level)}>
                                            {level}
                                        </Button>
                                    ))}
                                </Div>
                            </Div>
                        )}
                    />
                </Card>

                <Card className="bg-background gap-3 rounded-[28px] border-0 px-5 py-5">
                    <SectionTitle eyebrow="Next step" title="Exercise management" note="This editor handles plan structure. Use the Add screen to create or expand the movement library for the active plan." />
                    <Button variant="outline" className="h-14 rounded-2xl" onPress={() => router.push("/(tabs)/add")}>
                        Open Add Screen
                    </Button>
                </Card>

                <Button className="h-16 rounded-2xl" onPress={methods.handleSubmit((values) => savePlan(values, false))}>
                    Save Changes
                </Button>

                <Button variant="outline" className="h-16 rounded-2xl" onPress={methods.handleSubmit((values) => savePlan(values, true))}>
                    Save As New Plan
                </Button>

                {activePlan && plans.length > 1 ? (
                    <Button
                        variant="outline"
                        className="h-16 rounded-2xl"
                        onPress={() =>
                            Alert.alert("Delete plan", "This removes the selected plan and its exercises from this device.", [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Delete",
                                    style: "destructive",
                                    onPress: async () => {
                                        const result = await deleteWorkoutPlan(user.id, activePlan.id);
                                        if (!result.success) {
                                            toast.error("Could not delete plan");
                                            return;
                                        }
                                        toast.success("Plan deleted");
                                        router.back();
                                    },
                                },
                            ])
                        }>
                        Delete Selected Plan
                    </Button>
                ) : null}
            </Div>
        </Screen>
    );
}

function EditorPill({ label, value }: { label: string; value: string }) {
    return (
        <Div className="flex-1 rounded-3xl bg-white/12 px-4 py-4">
            <P className="text-xs text-white/75 uppercase">{label}</P>
            <P className="mt-1 text-xl text-white">{value}</P>
        </Div>
    );
}

function SectionTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
    return (
        <Div className="gap-1">
            <Badge variant="outline">{eyebrow}</Badge>
            <H2 className="text-2xl">{title}</H2>
            <P className="text-muted-foreground text-sm">{note}</P>
        </Div>
    );
}
