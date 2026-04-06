import { Button } from "../ui/interactive";
import { ErrorMessage } from "../ui/screen-ui";
import { Card, Div, Field, H3, P, Row } from "../ui/display";

import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useFormContext } from "react-hook-form";
import { FITNESS_LEVELS, GOALS, SESSION_LENGTHS } from "@/constants/data";

export default function Goals() {
    const { control } = useFormContext();

    return (
        <Div className="gap-5">
            <Controller
                name="goal"
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <Card className="items-start gap-4 border-0">
                        <H3>Goal</H3>
                        <Div className="gap-3">
                            {GOALS.map((goal) => {
                                const selected = value === goal.label;
                                return (
                                    <Button key={goal.label} onPress={() => onChange(goal.label)} variant={selected ? "primary" : "outline"} className="h-auto justify-start rounded-3xl p-4" component>
                                        <Row className="gap-4">
                                            <Div className={cn("size-11 items-center justify-center rounded-2xl", selected ? "bg-white/15" : "bg-muted")}>
                                                <Ionicons name={goal.icon as any} size={20} color={selected ? "#fff9e3" : "#081126"} />
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
                        <ErrorMessage message={error?.message} />
                    </Card>
                )}
            />

            <Card className="gap-4 border-0">
                <Controller
                    name="fitnessLevel"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <Field label="Fitness Level">
                            <Row className="gap-4">
                                {FITNESS_LEVELS.map((level) => (
                                    <Button key={level} variant={value === level ? "secondary" : "outline"} className="flex-1 px-2" size={"lg"} onPress={() => onChange(level)}>
                                        {level}
                                    </Button>
                                ))}
                            </Row>
                        </Field>
                    )}
                />

                <Controller
                    name="sessionLength"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <Field label="Target Session Length">
                            <Div className="row flex-wrap gap-4">
                                {SESSION_LENGTHS.map((minutes) => (
                                    <Button key={minutes} variant={value === minutes ? "secondary" : "outline"} className="min-w-36 flex-1 px-4" size={"lg"} onPress={() => onChange(minutes)}>
                                        {minutes} min
                                    </Button>
                                ))}
                            </Div>
                        </Field>
                    )}
                />
            </Card>
        </Div>
    );
}
