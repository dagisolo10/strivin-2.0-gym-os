import { Button, Input } from "../ui/button";
import { Div, Label, P, Row } from "../ui/view";
import { weekdays } from "../../constants/data";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

export default function Frequency() {
    const { control } = useFormContext();
    const [custom, setCustom] = useState(false);

    return (
        <Div className="gap-4">
            <Controller
                name="split"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Div>
                        <Label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Split Strategy</Label>
                        <Div className="gap-4">
                            <Button variant={value === "Push Pull Leg" ? "primary" : "outline"} onPress={() => onChange("Push Pull Leg")}>
                                Push Pull Leg
                            </Button>
                            <Button variant={value === "Upper Lower" ? "primary" : "outline"} onPress={() => onChange("Upper Lower")}>
                                Upper / Lower
                            </Button>
                            <Button variant={value === "Full Body" ? "primary" : "outline"} onPress={() => onChange("Full Body")}>
                                Full Body
                            </Button>
                            <Button variant={value === "Endurance" ? "primary" : "outline"} onPress={() => onChange("Endurance")}>
                                Endurance
                            </Button>
                            <Div className="row">
                                <Button
                                    variant={custom ? "primary" : "outline"}
                                    className="flex-1"
                                    onPress={() => {
                                        onChange("");
                                        setCustom(true);
                                    }}>
                                    Add Custom
                                </Button>
                                {custom && <Input className="w-67" onChangeText={(val) => onChange(val)} placeholder="Custom" />}
                            </Div>
                            {error && <Label className="text-destructive">{error.message}</Label>}
                        </Div>
                    </Div>
                )}
            />

            <Controller
                control={control}
                name="workoutDays"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Div className="gap-4">
                        <Div className="items-start">
                            <Label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Training Frequency</Label>
                            <Div className="bg-primary/30 w-36 rounded-xl border border-blue-500/20 px-4 py-2">
                                <P className="text-primary text-lg font-black">
                                    {value.length} {value.length > 1 ? "Days" : "Day"} / Week
                                </P>
                            </Div>
                        </Div>

                        <Div>
                            <Label className="mb-2 text-xs font-bold tracking-widest text-zinc-500 uppercase">Pick Working Days</Label>
                            <Row className="flex-wrap justify-center gap-6">
                                {weekdays.map((day) => {
                                    const isActive = value.includes(day);
                                    return (
                                        <Button
                                            key={day}
                                            variant={isActive ? "primary" : "outline"}
                                            onPress={() => {
                                                const nextValue = isActive ? value.filter((d: string) => d !== day) : [...value, day];
                                                onChange(nextValue);
                                            }}
                                            textClassName={cn("text-lg font-bold", isActive ? "text-white" : "text-zinc-500")}
                                            className={cn("w-48 rounded-2xl border", isActive ? "border-blue-400" : "border-zinc-800")}>
                                            {day.substring(0, 3)}
                                        </Button>
                                    );
                                })}
                            </Row>
                            {error && <Label className="text-destructive">{error.message}</Label>}
                        </Div>
                    </Div>
                )}
            />
        </Div>
    );
}
