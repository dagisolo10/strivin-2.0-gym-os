import { ErrorMessage } from "../ui/screen-ui";
import { Button, Input } from "../ui/interactive";
import { Badge, Card, Div, P, Row } from "../ui/display";
import { weekdays, WORKOUT_SPLIT } from "../../constants/data";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

export default function Frequency() {
    const { control } = useFormContext();
    const [custom, setCustom] = useState(false);

    return (
        <Div className="gap-5">
            <Controller
                name="split"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Card className="gap-4 rounded-4xl border-0">
                        <Row>
                            <Badge variant="outline">Split</Badge>
                            <P className="text-muted-foreground text-sm">Choose the structure you want to follow.</P>
                        </Row>

                        <Div className="gap-3">
                            {WORKOUT_SPLIT.map((option) => (
                                <Button
                                    key={option}
                                    variant={value === option ? "primary" : "outline"}
                                    onPress={() => {
                                        onChange(option);
                                        setCustom(false);
                                    }}
                                    className={cn("justify-start px-5", value === option && "shadow-primary/20")}>
                                    {option}
                                </Button>
                            ))}

                            <Button
                                variant={custom ? "primary" : "outline"}
                                className="justify-start px-5"
                                onPress={() => {
                                    setCustom(true);
                                    onChange("");
                                }}>
                                Custom split
                            </Button>

                            {custom && <Input value={typeof value === "string" ? value : ""} onChangeText={onChange} placeholder="e.g. Strength + Conditioning" />}
                            <ErrorMessage message={error?.message} />
                        </Div>
                    </Card>
                )}
            />

            <Controller
                control={control}
                name="workoutDays"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Card className="gap-4 border-0">
                        <Row>
                            <Badge variant="outline">Schedule</Badge>
                            <P className="text-lg">
                                {value.length} training day{value.length === 1 ? "" : "s"} each week
                            </P>
                        </Row>

                        <Div className="row flex-wrap gap-3">
                            {weekdays.map((day) => {
                                const isSelected = value.includes(day);
                                return (
                                    <Button
                                        key={day}
                                        variant={isSelected ? "secondary" : "outline"}
                                        textClassName={isSelected ? "text-background" : "text-muted-foreground"}
                                        className={cn(error && "border-destructive", "min-w-28 flex-1 px-4")}
                                        onPress={() => {
                                            const next = isSelected ? value.filter((d: string) => d !== day) : [...value, day];
                                            onChange(next);
                                        }}>
                                        {day}
                                    </Button>
                                );
                            })}
                        </Div>
                        <ErrorMessage message={error?.message} />
                    </Card>
                )}
            />
        </Div>
    );
}
