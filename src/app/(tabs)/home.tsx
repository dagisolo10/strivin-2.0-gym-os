import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";
import Header from "@/components/home/header";
import { useHomeData } from "@/hooks/use-home";
import RestDay from "@/components/home/rest-day";
import Snapshot from "@/components/home/snapshot";
import { calculateStreak } from "@/server/workout";
import { usePlanStore } from "@/store/use-plan-store";
import StatusCard from "@/components/home/status-card";
import { FlatList } from "react-native-gesture-handler";
import { getWeekdayName } from "@/lib/helper-functions";
import DayCarousel from "@/components/home/day-carousel";
import ExerciseCard from "@/components/home/exercise-card";
import { PlanCarousel } from "@/components/plans/plan-carousel";
import { LoadingScreen, ErrorScreen } from "@/components/ui/screen-ui";
import { Badge, Div, H3, Row, Screen, Separator } from "@/components/ui/view";

export default function HomeScreen() {
    const { isLoading, dataHash, user } = useUser();

    const [selectedDayName, setSelectedDayName] = useState<Weekday>(getWeekdayName());
    const [expandedExerciseId, setExpandedExerciseId] = useState<number | null>(null);

    const { plans, plan, todaysLogs, workoutDay, todayKey, exercises } = useHomeData(user, selectedDayName);

    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);

    const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets ?? 1), 0) || 0;
    const totalExercises = plan.days.reduce((sum, day) => sum + day.exercises.length, 0);
    const completedSets = todaysLogs.length;
    const progress = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;

    const userSessions = user?.sessions || [];
    const todaysSession = userSessions.find((session) => session.date === todayKey);

    const streak = calculateStreak(userSessions);

    useEffect(() => {
        if (user?.plans) syncSelectedPlan(plans.map((plan) => plan.id));
    }, [plans, syncSelectedPlan, user?.plans]);

    if (isLoading) return <LoadingScreen />;

    if (!user || !plan) return <ErrorScreen message="Finish your setup to unlock your dashboard." href="/onboarding" button="Open onboarding" />;

    return (
        <Screen className="px-6 pt-8" nonScrollable>
            <FlatList
                ListHeaderComponent={
                    <Div className="gap-6">
                        <Header user={user} todayKey={todayKey} />

                        <StatusCard streak={streak} plan={plan} progress={progress} completedSets={completedSets} totalSets={totalSets} />

                        <PlanCarousel plans={plans} selectedPlanId={plan.id} onSelect={setSelectedPlanId} title="Plan Library" subtitle="Swipe through plans and choose which routine you want to run today." />

                        <Snapshot plan={plan} totalExercises={totalExercises} />

                        <DayCarousel selectedDayName={selectedDayName} plan={plan} onSelect={setSelectedDayName} />

                        <Row className="mb-2">
                            <H3>{workoutDay?.dayName === getWeekdayName() ? "Today's Routine" : `${selectedDayName}'s Routine`}</H3>
                            <Badge variant={todaysSession?.perfectDay ? "success" : "outline"}>{todaysSession?.perfectDay ? "Perfect Day" : "In Progress"}</Badge>
                        </Row>
                    </Div>
                }
                ListFooterComponent={() => <Separator vertical />}
                data={exercises || []}
                extraData={`${dataHash}-${todaysLogs.length}-${exercises?.length ?? 0}`}
                keyExtractor={(ex) => String(ex.id)}
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-32"
                ItemSeparatorComponent={() => <Separator vertical size={12} />}
                ListEmptyComponent={<RestDay selectedDayName={selectedDayName} />}
                renderItem={({ item: exercise }) => (
                    <ExerciseCard
                        userId={user.id}
                        exercise={exercise}
                        selectedDayName={selectedDayName}
                        expandedId={expandedExerciseId}
                        logs={todaysLogs?.filter((log) => log.exerciseId === exercise.id) ?? []}
                        onPress={() => setExpandedExerciseId((currentId) => (currentId === exercise.id ? null : exercise.id))}
                    />
                )}
            />
        </Screen>
    );
}
