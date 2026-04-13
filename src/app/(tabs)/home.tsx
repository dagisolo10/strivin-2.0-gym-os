import { usePlan } from "@/hooks/use-plan";
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

    const { activePlan } = usePlan();
    const { isLoading, updatedAt, user, plans, enrichedPlans, workoutDays, sessionsWithLogs, logs } = useAppData({ includePlanDetails: true, includeWorkoutHistory: true });
    const localUserId = useAuthStore((state) => state.localUserId);

    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);

    const handleExerciseLogged = (feedback: { event: "perfectDay" | "newStreak" | "newLongestStreak" }) => setConfettiEvent(feedback.event);
    const isWorkoutDay = Boolean(activePlan?.days.some((day) => day.dayName === selectedDayName));

    const { tables, values } = useHomeData(selectedDayName, { activePlan, workoutDays, sessions: sessionsWithLogs, logs });
    const { workoutDay, todaysSession, todaysExercises, todaysLogsByExerciseId } = tables;
    const { progress, totalExercises, completedSets, totalSets } = values;

    const isPerfectDay = useMemo(() => {
        if (!activePlan || !todaysSession) return false;
        return computePerfectDay(activePlan, todaysSession);
    }, [activePlan, todaysSession]);

    useEffect(() => {
        if (enrichedPlans.length) syncSelectedPlan(enrichedPlans.map((plan) => plan.localId));
    }, [enrichedPlans, syncSelectedPlan]);

    if (isLoading) return <LoadingScreen />;

    if (!user || !localUserId) {
        const debugInfo = __DEV__ ? ` Debug Info: ${JSON.stringify(user ?? "No Local User Found")}` : "";
        return <ErrorScreen message={`Session not available. Please sign in again. ${debugInfo}`} href="/(auth)/sign-in" button="Go to sign in" />;
    }

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
                                progress={progress}
                                totalSets={totalSets}
                                currentStreak={user.currentStreak ?? 0}
                                longestStreak={user.longestStreak ?? 0}
                                completedSets={completedSets}
                            />

                            <PlanCarousel
                                plans={enrichedPlans}
                                selectedPlanId={activePlan.localId}
                                onSelect={setSelectedPlanId}
                                title="Plan Library"
                                subtitle="Swipe through plans and choose which routine you want to run today."
                            />

                            <Snapshot plan={activePlan} totalExercises={totalExercises} />

                            <DayCarousel selectedDayName={selectedDayName} plan={activePlan} onSelect={setSelectedDayName} />

                            <Row className="mb-2">
                                <H3>{workoutDay?.dayName === getWeekdayName() ? "Today's Routine" : `${selectedDayName}'s Routine`}</H3>
                                <Badge variant={isPerfectDay ? "success" : "outline"}>{!todaysSession ? "Not Started" : isPerfectDay ? "Perfect Day" : "In Progress"}</Badge>
                            </Row>
                        </Div>
                    }
                    ListFooterComponent={() => <Separator vertical />}
                    data={todaysExercises}
                    extraData={`${updatedAt}-${expandedExerciseId}-${completedSets}-${todaysExercises?.length ?? 0}`}
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
                            logs={todaysLogsByExerciseId[exercise.localId] ?? []}
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
