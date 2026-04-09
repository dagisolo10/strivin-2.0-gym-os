import { DAY_ORDER } from "@/constants/data";
import { useAppData } from "@/hooks/use-app-data";
import { useEffect, useMemo, useState } from "react";
import type { GroupedExercise } from "@/types/types";
import { usePlanStore } from "@/store/use-plan-store";
import { FlatList } from "react-native";
import { PlanCarousel } from "@/components/plans/plan-carousel";
import { ErrorScreen, LoadingScreen } from "@/components/ui/screen-ui";
import ExerciseDetailsCard from "@/components/exercise/exercise-details-card";
import { Badge, Card, Div, H2, H3, P, Row, Screen, Separator } from "@/components/ui/display";

const createExerciseSignature = (exercise: GroupedExercise["exercise"]) =>
    [
        exercise.name.trim().toLowerCase(),
        exercise.type,
        exercise.variant,
        exercise.sets ?? "",
        exercise.reps ?? "",
        exercise.weight ?? "",
        exercise.distance ?? "",
        exercise.duration ?? "",
        exercise.unit ?? "",
    ].join("|");

export default function AllExercisesScreen() {
    const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

    const { isLoading, updatedAt, user, enrichedPlans } = useAppData({
        includePlanDetails: true,
        includeWorkoutHistory: false,
    });

    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);
    const selectedPlanId = usePlanStore((state) => state.selectedPlanId);
    const activePlan = enrichedPlans.find((plan) => plan.localId === selectedPlanId) ?? enrichedPlans[0] ?? null;

    useEffect(() => {
        if (enrichedPlans.length) syncSelectedPlan(enrichedPlans.map((plan) => plan.localId));
    }, [enrichedPlans, syncSelectedPlan]);

    const groupedExercises = useMemo<GroupedExercise[]>(() => {
        if (!activePlan) return [];

        const groups = new Map<string, GroupedExercise>();

        for (const day of activePlan.days) {
            for (const exercise of day.exercises) {
                const signature = createExerciseSignature(exercise);
                const existingGroup = groups.get(signature);

                if (existingGroup) {
                    existingGroup.exerciseIds.push(exercise.localId);
                    if (!existingGroup.workoutDays.includes(day.dayName)) existingGroup.workoutDays.push(day.dayName);
                    continue;
                }

                groups.set(signature, {
                    localId: exercise.localId,
                    exerciseIds: [exercise.localId],
                    workoutDays: [day.dayName],
                    exercise: {
                        ...exercise,
                        usesWeight: exercise.type !== "Core" || Boolean(exercise.weight),
                    },
                });
            }
        }

        return [...groups.values()]
            .map((group) => ({
                ...group,
                workoutDays: [...group.workoutDays].sort((a: Weekday, b: Weekday) => DAY_ORDER[a] - DAY_ORDER[b]),
            }))
            .sort((a: GroupedExercise, b: GroupedExercise) => {
                const firstDayComparison = DAY_ORDER[a.workoutDays[0]] - DAY_ORDER[b.workoutDays[0]];
                if (firstDayComparison !== 0) return firstDayComparison;
                return a.exercise.name.localeCompare(b.exercise.name);
            });
    }, [activePlan]);

    const totalAssignedExercises = activePlan?.days.reduce((total, day) => total + day.exercises.length, 0) ?? 0;
    const availableDays = useMemo(() => {
        if (!activePlan) return [];
        return [...new Set(activePlan.days.map((day) => day.dayName))].sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b]);
    }, [activePlan]);

    if (isLoading) return <LoadingScreen />;

    if (!user || !activePlan) return <ErrorScreen message="Finish your setup to unlock your exercises." href="/onboarding" button="Open onboarding" />;

    return (
        <Screen nonScrollable>
            <FlatList
                data={groupedExercises}
                extraData={`${updatedAt}-${expandedExerciseId}-${groupedExercises.length}`}
                keyExtractor={(exercise) => exercise.localId}
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-24"
                ItemSeparatorComponent={() => <Separator vertical size={12} />}
                ListHeaderComponent={
                    <Div className="gap-6">
                        <H2>Exercises</H2>
                        <Card className="gap-3" variant={"accent"}>
                            <Row className="items-center justify-between gap-3">
                                <H3 className="flex-1 text-white">{activePlan.split}</H3>
                                <Badge variant="glass">{groupedExercises.length} exercises</Badge>
                            </Row>
                            <P className="text-sm text-white/80">
                                Browse the exercise library for the active plan, expand any card for full details, and manage it without leaving this tab.
                            </P>
                        </Card>

                        <PlanCarousel
                            plans={enrichedPlans}
                            selectedPlanId={activePlan.localId}
                            onSelect={setSelectedPlanId}
                            title="Active Plan"
                            subtitle="Switch plans to see the exercises assigned to that routine."
                        />

                        <Row className="mb-2 gap-3">
                            <Badge variant="muted">{activePlan.days.length} workout days</Badge>
                            <Badge variant="outline">{totalAssignedExercises} assigned entries</Badge>
                        </Row>
                    </Div>
                }
                ListEmptyComponent={<EmptyState />}
                renderItem={({ item }) => (
                    <ExerciseDetailsCard
                        groupedExercise={item}
                        availableDays={availableDays}
                        userId={user.localId}
                        planId={activePlan.localId}
                        isExpanded={expandedExerciseId === item.localId}
                        onToggle={(expanded) => setExpandedExerciseId(expanded ? item.localId : null)}
                        onExerciseUpdated={() => setExpandedExerciseId(null)}
                        onExerciseDeleted={() => setExpandedExerciseId(null)}
                    />
                )}
            />
        </Screen>
    );
}

function EmptyState() {
    return (
        <Div className="items-center justify-center py-12">
            <H3 className="text-muted-foreground text-center">No exercises found</H3>
            <P className="text-muted-foreground text-center text-sm">Add exercises to this plan to build out the library.</P>
        </Div>
    );
}
