import { WorkoutPlanWithDays } from "@/types/types";
import { NavLink } from "@/components/ui/interactive";
import { Card, Div, H3, P, Row } from "@/components/ui/display";

interface SnapshotProp {
    plan: WorkoutPlanWithDays;
    totalExercises: number;
}

export default function Snapshot({ plan, totalExercises }: SnapshotProp) {
    return (
        <Card className="gap-3">
            <Row>
                <Div>
                    <P className="text-muted-foreground text-xs tracking-wider uppercase">Active Plan</P>
                    <H3>{plan.split}</H3>
                </Div>
            </Row>
            <Row className="gap-4">
                <InfoPill label="Days / Week" value={String(plan.workoutDaysPerWeek)} />
                <InfoPill label="Experience" value={plan.fitnessLevel ?? "Beginner"} />
            </Row>
            <Row className="gap-4">
                <NavLink className="flex-1" href={{ pathname: "/plan-editor", params: { mode: "new" } }} variant={"outline"}>
                    New Plan
                </NavLink>
                <NavLink className="flex-1" href="/plan-editor" variant={"outline"}>
                    Edit Plan
                </NavLink>
            </Row>
            <P className="text-muted-foreground text-sm">
                {totalExercises} exercises planned across {plan.workoutDaysPerWeek} active days.
            </P>
        </Card>
    );
}

function InfoPill({ label, value }: { label: string; value: string }) {
    return (
        <Div className="bg-muted flex-1 rounded-2xl px-4 py-3">
            <P className="text-muted-foreground text-xs uppercase">{label}</P>
            <P className="mt-1 text-sm">{value}</P>
        </Div>
    );
}
