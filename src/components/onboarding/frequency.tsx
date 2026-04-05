import { Button, Input } from "../ui/button";
import { weekdays } from "../../constants/data";
import { Badge, Card, Div, P, Row } from "../ui/view";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

const splitOptions: WorkoutSplit[] = ["Push Pull Leg", "Upper Lower", "Full Body", "Endurance"];

export default function Frequency() {
    const { control } = useFormContext();
    const [custom, setCustom] = useState(false);

    return (
        <Div className="gap-5">
            <Controller
                name="split"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Card className="bg-muted/50 gap-4 rounded-4xl border-0 p-5">
                        <Row>
                            <Badge variant="outline">Split</Badge>
                            <P className="text-muted-foreground text-sm">Choose the structure you want to follow.</P>
                        </Row>

                        <Div className="gap-3">
                            {splitOptions.map((option) => (
                                <Button key={option} variant={value === option ? "primary" : "outline"} onPress={() => onChange(option)} className={cn("h-14 justify-start rounded-2xl px-5", value === option && "shadow-primary/20")}>
                                    {option}
                                </Button>
                            ))}

                            <Button
                                variant={custom ? "primary" : "outline"}
                                className="h-14 justify-start rounded-2xl px-5"
                                onPress={() => {
                                    setCustom(true);
                                    onChange("");
                                }}>
                                Custom split
                            </Button>

                            {custom ? <Input value={typeof value === "string" ? value : ""} onChangeText={onChange} placeholder="e.g. Strength + Conditioning" className="rounded-2xl text-base" /> : null}
                            {error ? <P className="text-destructive text-sm">{error.message}</P> : null}
                        </Div>
                    </Card>
                )}
            />

            <Controller
                control={control}
                name="workoutDays"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Card className="bg-background gap-4 rounded-[28px] border-0 px-5 py-5">
                        <Row>
                            <Badge variant="outline">Schedule</Badge>
                            <P className="text-lg">
                                {value.length} training day{value.length === 1 ? "" : "s"} each week
                            </P>
                        </Row>

                        <Div className="row flex-wrap gap-3">
                            {weekdays.map((day) => {
                                const selected = value.includes(day);
                                return (
                                    <Button key={day} variant={selected ? "secondary" : "outline"} onPress={() => onChange(selected ? value.filter((d: string) => d !== day) : [...value, day])} className="min-w-21 flex-1 rounded-2xl px-4">
                                        {day.slice(0, 3)}
                                    </Button>
                                );
                            })}
                        </Div>
                        {error ? <P className="text-destructive text-sm">{error.message}</P> : null}
                    </Card>
                )}
            />
        </Div>
    );
}
