import { Button } from "../ui/button";
import { Card, Div, H3, Label, P, Row } from "../ui/view";

import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useFormContext } from "react-hook-form";

const goals: { label: Goal; icon: keyof typeof Ionicons.glyphMap; note: string }[] = [
    { label: "Hypertrophy", icon: "flash-outline", note: "Build size with steady progressive overload." },
    { label: "Strength", icon: "barbell-outline", note: "Bias heavier work and lower rep targets." },
    { label: "Endurance", icon: "heart-outline", note: "Improve stamina and work capacity." },
    { label: "Fat Loss", icon: "walk-outline", note: "Stay consistent with training volume & cardio." },
];

export default function Goals() {
    const { control } = useFormContext();

    return (
        <Div className="gap-5">
            <Controller
                name="goal"
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <Card className="bg-muted/50 items-start gap-4 rounded-4xl border-0 px-5 py-5">
                        <H3>Goal</H3>
                        <Div className="gap-3">
                            {goals.map((goal) => {
                                const selected = value === goal.label;
                                return (
                                    <Button key={goal.label} onPress={() => onChange(goal.label)} variant={selected ? "primary" : "outline"} className="h-auto justify-start rounded-3xl p-4" component>
                                        <Row className="gap-4">
                                            <Div className={cn("size-11 items-center justify-center rounded-2xl", selected ? "bg-white/15" : "bg-muted")}>
                                                <Ionicons name={goal.icon} size={20} color={selected ? "#fff9e3" : "#081126"} />
                                            </Div>
                                            <Div className="flex-1 gap-1">
                                                <P className={selected ? "text-background" : "text-foreground"}>{goal.label}</P>
                                                <P className={cn("text-sm font-medium", selected ? "text-background/80" : "text-muted-foreground")}>{goal.note}</P>
                                            </Div>
                                        </Row>
                                    </Button>
                                );
                            })}
                        </Div>
                        {error ? <P className="text-destructive text-sm">{error.message}</P> : null}
                    </Card>
                )}
            />

            <Card className="bg-background gap-4 rounded-4xl border-0 p-5">
                <Controller
                    name="fitnessLevel"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <Div>
                            <Label>Fitness Level</Label>
                            <Row className="gap-3">
                                {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => (
                                    <Button key={level} variant={value === level ? "secondary" : "outline"} className="flex-1 rounded-2xl px-2" onPress={() => onChange(level)}>
                                        {level}
                                    </Button>
                                ))}
                            </Row>
                        </Div>
                    )}
                />

                <Controller
                    name="sessionLength"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <Div>
                            <Label>Target Session Length</Label>
                            <Div className="row flex-wrap gap-3">
                                {[30, 45, 60, 90].map((minutes) => (
                                    <Button key={minutes} variant={value === minutes ? "secondary" : "outline"} className="min-w-36 flex-1 rounded-2xl px-4" onPress={() => onChange(minutes)}>
                                        {minutes} min
                                    </Button>
                                ))}
                            </Div>
                        </Div>
                    )}
                />
            </Card>
        </Div>
    );
}
