import { WorkoutPlanWithDays } from "@/store/use-static-store";
import { Badge, Card, Div, H1, P, Row } from "@/components/ui/display";

interface StatusCardProp {
    streak: {
        current: number;
        longest: number;
    };
    plan: WorkoutPlanWithDays;
    progress: number;
    completedSets: number;
    totalSets: number;
}

export default function StatusCard({ streak, plan, progress, completedSets, totalSets }: StatusCardProp) {
    return (
        <Card variant={"accent"} className="gap-4">
            <Row className="items-start">
                <Div className="flex-1">
                    <P className="font-medium text-white/80">Current streak</P>
                    <H1 className="mt-1 text-white">{streak.current} Days</H1>
                    <P className="mt-2 text-white/80">Longest: {streak.longest} days</P>
                </Div>
                <Badge variant="glass">{plan.goal ?? "Consistency"}</Badge>
            </Row>

            <Div className="gap-2">
                <Row>
                    <P className="text-sm font-bold text-white">Daily progress</P>
                    <P className="text-sm font-bold text-white">{progress}%</P>
                </Row>
                <Div className="h-3 overflow-hidden rounded-full bg-white/20">
                    <Div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
                </Div>
                <P className="text-sm text-white/80">
                    {completedSets} of {totalSets} planned sets logged
                </P>
            </Div>
        </Card>
    );
}
