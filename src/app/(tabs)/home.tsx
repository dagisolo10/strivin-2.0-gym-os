import { FlatList, View } from "react-native";
import Header from "@/components/home/header";
import { useHomeData } from "@/hooks/use-home";
import RestDay from "@/components/home/rest-day";
import { useAppData } from "@/hooks/use-app-data";
import Snapshot from "@/components/home/snapshot";
import { computePerfectDay } from "@/server/workout";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { usePlanStore } from "@/store/use-plan-store";
import ConfettiOverlay from "@/components/ui/confetti";
import StatusCard from "@/components/home/status-card";
import { getWeekdayName } from "@/lib/helper-functions";
import DayCarousel from "@/components/home/day-carousel";
import ExerciseCard from "@/components/home/exercise-card";
import { PlanCarousel } from "@/components/plans/plan-carousel";
import { LoadingScreen, ErrorScreen } from "@/components/ui/screen-ui";
import { Badge, Div, H3, Row, Screen, Separator } from "@/components/ui/display";

export default function HomeScreen() {
    const [selectedDayName, setSelectedDayName] = useState<Weekday>(getWeekdayName());
    const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
    const [confettiEvent, setConfettiEvent] = useState<"perfectDay" | "newStreak" | "newLongestStreak" | null>(null);

    const { isLoading, updatedAt, user, plans, enrichedPlans, workoutDays, sessionsWithLogs, logs } = useAppData({
        includePlanDetails: true,
        includeWorkoutHistory: true,
    });
    const localUserId = useAuthStore((state) => state.localUserId);

    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);
    const selectedPlanId = usePlanStore((state) => state.selectedPlanId);
    const activePlan = enrichedPlans.find((plan) => plan.localId === selectedPlanId) ?? enrichedPlans[0] ?? null;
    const handleExerciseLogged = (feedback: { event: "perfectDay" | "newStreak" | "newLongestStreak" }) => setConfettiEvent(feedback.event);
    const isWorkoutDay = Boolean(activePlan?.days.some((day) => day.dayName === selectedDayName));
    const { tables, values } = useHomeData(selectedDayName, { activePlan, workoutDays, sessions: sessionsWithLogs, logs });

    const isPerfectDay = useMemo(() => {
        if (!activePlan || !tables.todaysSession) return false;
        return computePerfectDay(activePlan, tables.todaysSession);
    }, [activePlan, tables.todaysSession]);

    useEffect(() => {
        if (enrichedPlans.length) syncSelectedPlan(enrichedPlans.map((plan) => plan.localId));
    }, [enrichedPlans, syncSelectedPlan]);

    if (isLoading) return <LoadingScreen />;

    if (!user || !localUserId)
        return <ErrorScreen message={`Session not available. Please sign in again. Debug Info: ${JSON.stringify(user || "No Local User Found")}`} href="/(auth)/sign-in" button="Go to sign in" />;

    if (!activePlan) return <ErrorScreen message="Finish your setup to unlock your dashboard." href="/onboarding" button="Open onboarding" />;

    return (
        <Screen nonScrollable>
            <View className="flex-1">
                <FlatList
                    ListHeaderComponent={
                        <Div className="gap-6">
                            <Header user={{ ...user, plans, sessions: sessionsWithLogs }} />

                            <StatusCard
                                plan={activePlan}
                                progress={values.progress}
                                totalSets={values.totalSets}
                                currentStreak={user.currentStreak ?? 0}
                                longestStreak={user.longestStreak ?? 0}
                                completedSets={values.completedSets}
                            />

                            <PlanCarousel
                                plans={enrichedPlans}
                                selectedPlanId={activePlan.localId}
                                onSelect={setSelectedPlanId}
                                title="Plan Library"
                                subtitle="Swipe through plans and choose which routine you want to run today."
                            />

                            <Snapshot plan={activePlan} totalExercises={values.totalExercises} />

                            <DayCarousel selectedDayName={selectedDayName} plan={activePlan} onSelect={setSelectedDayName} />

                            <Row className="mb-2">
                                <H3>{tables.workoutDay?.dayName === getWeekdayName() ? "Today's Routine" : `${selectedDayName}'s Routine`}</H3>
                                <Badge variant={isPerfectDay ? "success" : "outline"}>{!tables.todaysSession ? "Not Started" : isPerfectDay ? "Perfect Day" : "In Progress"}</Badge>
                            </Row>
                        </Div>
                    }
                    ListFooterComponent={() => <Separator vertical />}
                    data={tables.todaysExercises}
                    extraData={`${updatedAt}-${expandedExerciseId}-${values.completedSets}-${tables.todaysExercises?.length ?? 0}`}
                    keyExtractor={(ex) => String(ex.localId)}
                    showsVerticalScrollIndicator={false}
                    contentContainerClassName="pb-24"
                    ItemSeparatorComponent={() => <Separator vertical size={12} />}
                    ListEmptyComponent={<RestDay selectedDayName={selectedDayName} isWorkoutDay={isWorkoutDay} />}
                    renderItem={({ item: exercise }) => (
                        <ExerciseCard
                            userId={localUserId}
                            exercise={exercise}
                            selectedDayName={selectedDayName}
                            expandedId={expandedExerciseId}
                            logs={tables.todaysLogsByExerciseId[exercise.localId] ?? []}
                            onPress={() => setExpandedExerciseId((currentId) => (currentId === exercise.localId ? null : exercise.localId))}
                            onExerciseLogged={handleExerciseLogged}
                        />
                    )}
                />

                <ConfettiOverlay event={confettiEvent} onFinished={() => setConfettiEvent(null)} />
            </View>
        </Screen>
    );
}
