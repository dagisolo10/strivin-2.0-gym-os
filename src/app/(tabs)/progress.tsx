import { useEffect, useMemo } from "react";
import { useUser } from "@/hooks/use-user";
import { ActivityIndicator } from "react-native";
import { calculateStreak } from "@/server/workout";
import { usePlanStore } from "@/store/use-plan-store";
import { FlatList } from "react-native-gesture-handler";
import { formatDateLabel } from "@/lib/helper-functions";
import { PlanCarousel } from "@/components/plans/plan-carousel";
import { Badge, Card, Div, H1, H2, H3, P, Row, Screen } from "@/components/ui/display";

export default function ProgressScreen() {
    const selectedPlanId = usePlanStore((state) => state.selectedPlanId);
    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);
    const { user } = useUser();

    const sessions = user?.sessions ?? [];
    const plans = useMemo(() => user?.plans ?? [], [user?.plans]);
    const planIds = plans.map((plan) => plan.id).join("|");

    useEffect(() => {
        syncSelectedPlan(plans.map((plan) => plan.id));
    }, [planIds, plans, syncSelectedPlan]);

    const activePlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];
    const plannedExerciseCount = activePlan?.days.reduce((sum, day) => sum + day.exercises.length, 0) ?? 0;
    const streak = calculateStreak(sessions);
    const totalVolume = sessions.reduce((sum, session) => sum + session.logs.reduce((sessionSum, log) => sessionSum + (log.weight ?? 0) * (log.reps ?? 0), 0), 0);
    const perfectDays = sessions.filter((session) => session.perfectDay).length;
    const averageSetsPerSession = sessions.length ? Math.round(sessions.reduce((sum, session) => sum + session.logs.length, 0) / sessions.length) : 0;
    const completionRate = sessions.length ? Math.round((perfectDays / sessions.length) * 100) : 0;

    if (!user) {
        return (
            <Screen className="items-center justify-center">
                <ActivityIndicator size="large" />
            </Screen>
        );
    }

    return (
        <Screen nonScrollable>
            <FlatList
                data={sessions.slice(0, 12)}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                contentContainerClassName="gap-3 pb-24"
                ListHeaderComponent={
                    <Div className="gap-6">
                        <H1>History & Insights</H1>

                        <Div className="gap-2">
                            <Div>
                                <H3>Progress</H3>
                                <P className="text-muted-foreground">See how your consistency, session quality, and training load are trending across your local workout history.</P>
                            </Div>

                            <Card variant={"accent"} className="gap-4">
                                <Row className="items-start">
                                    <Div className="flex-1 gap-1">
                                        <P className="text-sm text-white/80">Consistency score</P>
                                        <H1 className="text-white">{streak.current} Days</H1>
                                        <P className="text-sm text-white/80">Longest streak: {streak.longest} days</P>
                                    </Div>
                                    <Badge variant="glass">{perfectDays} perfect</Badge>
                                </Row>

                                <Div className="row gap-3">
                                    <InsightPill label="Volume" value={`${Math.round(totalVolume)}`} suffix="kg x reps" />
                                    <InsightPill label="Sessions" value={`${sessions.length}`} suffix="logged" />
                                    <InsightPill label="Avg Sets" value={`${averageSetsPerSession}`} suffix="per day" />
                                </Div>
                            </Card>
                        </Div>

                        <PlanCarousel plans={plans} selectedPlanId={activePlan?.id ?? null} onSelect={setSelectedPlanId} title="Focus Plan" subtitle="Use the carousel to inspect the routine you want to optimize next." />

                        <Row className="gap-3">
                            <StatCard label="Perfect days" value={`${perfectDays}`} suffix="total" />
                            <StatCard label="Current streak" value={`${streak.current}`} suffix="days" />
                        </Row>

                        <Card className="gap-4">
                            <Row className="items-start">
                                <Div className="flex-1 gap-1">
                                    <P className="text-muted-foreground text-sm">Session quality</P>
                                    <H2 className="text-2xl">{completionRate}%</H2>
                                    <P className="text-muted-foreground text-sm">of logged sessions ended as perfect days</P>
                                </Div>
                                <Badge variant={completionRate >= 60 ? "success" : "outline"}>{completionRate >= 60 ? "Strong trend" : "Building"}</Badge>
                            </Row>
                            <Div className="bg-muted h-3 overflow-hidden rounded-full">
                                <Div className="bg-primary h-full rounded-full" style={{ width: `${completionRate}%` }} />
                            </Div>
                        </Card>

                        <Card className="gap-4">
                            <Row className="items-start">
                                <Div className="flex-1 gap-1">
                                    <P className="text-muted-foreground text-sm">Selected plan</P>
                                    <H2 className="text-2xl">{activePlan.split}</H2>
                                    <P className="text-muted-foreground text-sm">{activePlan.goal ?? "General fitness"}</P>
                                </Div>
                                <Badge variant="outline">{activePlan.workoutDaysPerWeek} days</Badge>
                            </Row>
                            <Row className="gap-3">
                                <StatCard label="Planned moves" value={`${plannedExerciseCount}`} suffix="scheduled" />
                                <StatCard label="Fitness level" value={activePlan.fitnessLevel ?? "Beginner"} suffix="current" />
                            </Row>
                        </Card>

                        <Row className="items-center">
                            <H3>Recent Sessions</H3>
                            <Badge variant="secondary">{sessions.length}</Badge>
                        </Row>

                        {sessions.length !== 0 && (
                            <Card variant={"muted"}>
                                <P className="text-muted-foreground">Log your first workout from the home screen and your history will show up here.</P>
                            </Card>
                        )}
                    </Div>
                }
                renderItem={({ item: session }) => (
                    <Card className="bg-background gap-4 rounded-3xl border-0">
                        <Row>
                            <Div className="gap-1">
                                <P>{formatDateLabel(session.date)}</P>
                                <P className="text-muted-foreground text-sm">{session.logs.length} sets logged</P>
                            </Div>
                            <Badge variant={session.perfectDay ? "success" : "outline"}>{session.perfectDay ? "Perfect Day" : "Partial"}</Badge>
                        </Row>

                        {session.logs.slice(0, 4).map((log) => (
                            <Card key={log.id} variant={"muted"} className="row items-start justify-between gap-3">
                                <P className="text-sm">{log.exercise?.name}</P>
                                <P className="text-muted-foreground text-sm">
                                    {log.reps ?? log.duration ?? 0}
                                    {log.reps ? " reps" : " min"} {log.weight ? ` •  ${log.weight}${log.exercise?.unit ?? "kg"}` : ""}
                                </P>
                            </Card>
                        ))}

                        {session.logs.length > 4 ? <P className="text-muted-foreground text-sm">+{session.logs.length - 4} more logged entries</P> : null}
                    </Card>
                )}
            />
        </Screen>
    );
}

function StatCard({ label, value, suffix }: { label: string; value: string; suffix: string }) {
    return (
        <Card className="flex-1 gap-1 rounded-3xl px-5 py-5">
            <P className="text-muted-foreground text-sm uppercase">{label}</P>
            <H2 className="text-2xl">{value}</H2>
            <P className="text-muted-foreground text-sm">{suffix}</P>
        </Card>
    );
}

function InsightPill({ label, value, suffix }: { label: string; value: string; suffix: string }) {
    return (
        <Div className="flex-1 rounded-3xl bg-white/12 p-4">
            <P className="text-xs text-white/80 uppercase">{label}</P>
            <P className="mt-1 text-xl text-white">{value}</P>
            <P className="text-sm text-white/80">{suffix}</P>
        </Div>
    );
}
