import { Button } from "../ui/button";
import { Div, Row, P, Label } from "../ui/view";

import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useFormContext } from "react-hook-form";

export default function Goals() {
    const { control } = useFormContext();

    const goals: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { label: "Hypertrophy", icon: "flash-outline" },
        { label: "Strength", icon: "barbell-outline" },
        { label: "Endurance", icon: "heart-outline" },
        { label: "Fat Loss", icon: "heart-outline" },
    ];

    return (
        <Div className="gap-8">
            <Controller
                name="goal"
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <Div className="gap-3">
                        {goals.map((goal) => (
                            <Button key={goal.label} onPress={() => onChange(goal.label)} variant={value === goal.label ? "primary" : "outline"} className={cn("h-20 rounded-3xl border-2 p-0", value === goal.label ? "border-blue-400" : "border-zinc-800")}>
                                <Row>
                                    <Div className="flex-1 flex-row items-center gap-4">
                                        <Ionicons name={goal.icon} size={24} color={value === goal.label ? "#fff" : "#52525b"} />
                                        <P className={cn("text-xl font-semibold", value === goal.label ? "text-white" : "text-zinc-400")}>{goal.label}</P>
                                    </Div>
                                    {value === goal.label && <Ionicons name="checkmark-circle" size={36} color="#fff" />}
                                </Row>
                            </Button>
                        ))}
                        {error && <Label className="text-destructive mt-2 mb-0">{error.message}</Label>}
                    </Div>
                )}
            />
        </Div>
    );
}
