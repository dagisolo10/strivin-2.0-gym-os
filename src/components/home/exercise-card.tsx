import { cn } from "@/lib/utils";
import { toast } from "react-native-sonner";
import React, { useEffect, useState } from "react";
import { Button, Input } from "@/components/ui/button";
import { getWeekdayName } from "@/lib/helper-functions";
import { ExerciseWithLogs } from "@/store/use-static-store";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { calculateSuggestedLoad, logExerciseSet } from "@/server/workout";
import { Badge, Card, Div, H3, Label, P, Row } from "@/components/ui/view";

interface CardProp {
    logs: { id: number; exerciseId: number; reps: number | null; weight: number | null; duration: number | null; distance: number | null; completed: boolean; date: string }[];
    userId: number;
    onPress: () => void;
    expandedId: number | null;
    exercise: ExerciseWithLogs;
    selectedDayName: Weekday;
}

export default function ExerciseCard({ userId, exercise, logs, onPress, expandedId, selectedDayName }: CardProp) {
    const isExpanded = expandedId === exercise.id;
    const isReadOnly = selectedDayName !== getWeekdayName();

    const [isLogging, setIsLogging] = useState(false);

    const [weight, setWeight] = useState(exercise.weight?.toString() || "");
    const [reps, setReps] = useState(exercise.reps?.toString() || "");

    useEffect(() => {
        setWeight(exercise.weight?.toString() || "");
        setReps(exercise.reps?.toString() || "");
    }, [exercise.id, exercise.weight, exercise.reps]);

    const completedSets = logs.length;
    const targetSets = exercise.sets ?? 1;
    const completed = completedSets >= targetSets;

    const buttonVariant = isReadOnly ? "outline" : completed ? "success" : "primary";
    const buttonLabel = isReadOnly ? "View Only" : isLogging ? "Saving..." : completed ? "Log Extra Set" : `Log Set ${completedSets + 1}`;

    const parseInput = (val: string, fallback: number | null) => (isNaN(parseFloat(val)) ? (fallback ?? 0) : parseFloat(val));

    const averageReps = logs.length ? logs.reduce((sum, log) => sum + (log.reps ?? 0), 0) / logs.length : exercise.reps;
    const averageWeight = logs.length ? logs.reduce((sum, log) => sum + (log.weight ?? 0), 0) / logs.length : exercise.weight;

    const suggestedLoad = calculateSuggestedLoad(exercise.weight, averageWeight ?? undefined, averageReps ?? undefined, exercise.reps ?? undefined);
    const progressPercent = Math.min(Math.round((completedSets / targetSets) * 100), 100);

    const handleLogPress = async () => {
        if (isLogging) return;
        setIsLogging(true);

        const payload = {
            reps: exercise.type === "Cardio" ? 1 : parseInput(reps, exercise.reps),
            weight: exercise.type === "Cardio" ? undefined : parseInput(weight, exercise.weight),
            distance: exercise.type === "Cardio" ? parseInput(weight, exercise.distance) : undefined,
            duration: exercise.type === "Cardio" ? parseInput(reps, exercise.duration) : undefined,
        };

        try {
            await logExerciseSet({ userId, exerciseId: exercise.id, ...payload });
            toast.success("Set logged!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to log exercise");
        } finally {
            setIsLogging(false);
        }
    };

    const isCardio = exercise.type === "Cardio";

    const displayMetrics = {
        summary: isCardio
            ? `${exercise.distance ?? 0}${exercise.unit ?? "km"} • ${exercise.duration ?? 0} min`
            : `${targetSets} sets${exercise.reps ? `  •  ${exercise.reps} reps` : ""}${exercise.weight ? `  •  ${exercise.weight}${exercise.unit ?? "kg"}` : ""}`,

        bestAverage: isCardio ? `${Math.round(((averageWeight ?? exercise.distance ?? 0) as number) * 10) / 10}${exercise.unit ?? "km"}` : `${Math.round(((averageWeight ?? exercise.weight ?? 0) as number) * 10) / 10}${exercise.unit ?? "kg"}`,

        pacing: isCardio ? `${Math.round((averageReps ?? exercise.duration ?? 0) as number)} min` : `${Math.round((averageReps ?? exercise.reps ?? 0) as number)} reps`,
    };

    return (
        <Card className={cn("gap-0 rounded-[28px] border p-0", isExpanded && "border-primary/30 shadow-md")}>
            <MainButton onPress={onPress} exercise={exercise} completed={completed} completedSets={completedSets} targetSets={targetSets} targetSummary={displayMetrics.summary} isExpanded={isExpanded} />

            {isExpanded && (
                <Div className="gap-4 p-4">
                    <WorkoutProgress completed={completed} progressPercent={progressPercent} />

                    <MetricChips bestAverage={displayMetrics.bestAverage} pacing={displayMetrics.pacing} suggestedLoad={suggestedLoad} exercise={exercise} />
                    <InfoCards completedSets={completedSets} targetSets={targetSets} suggestedLoad={suggestedLoad} exercise={exercise} />

                    <Cardio type={exercise.type} exercise={exercise} weight={weight} setWeight={setWeight} reps={reps} setReps={setReps} isReadOnly={isReadOnly} />
                    <Weight type={exercise.type} exercise={exercise} weight={weight} setWeight={setWeight} reps={reps} setReps={setReps} isReadOnly={isReadOnly} />

                    <Button variant={buttonVariant} className={cn(isReadOnly && "opacity-50")} textClassName={isReadOnly ? "text-muted-foreground" : "text-background"} disabled={isLogging || isReadOnly} onPress={handleLogPress}>
                        {buttonLabel}
                    </Button>
                </Div>
            )}
        </Card>
    );
}

interface SubComponentProps {
    exercise: ExerciseWithLogs;
    type: ExerciseType;
    completed: boolean;
    progressPercent: number;
    completedSets: number;
    targetSets: number;
    targetSummary: string;
    bestAverage: string;
    pacing: string;
    suggestedLoad: number | null;
    weight: string;
    reps: string;
    setWeight: (val: string) => void;
    setReps: (val: string) => void;
    isReadOnly?: boolean;
}

interface MainButtonProp {
    onPress: () => void;
    exercise: ExerciseWithLogs;
    completed: boolean;
    completedSets: number;
    targetSets: number;
    targetSummary: string;
    isExpanded: boolean;
}

function MainButton({ onPress, exercise, completed, completedSets, targetSets, targetSummary, isExpanded }: MainButtonProp) {
    return (
        <Button variant="ghost" className="h-auto flex-row items-center justify-between p-4" onPress={onPress} component>
            <Div className="flex-1 gap-4">
                <Row className="flex-1 gap-4">
                    <Div className="row flex-1 gap-4">
                        <Div className="bg-muted size-12 items-center justify-center rounded-2xl">
                            <P className="text-primary font-bold">{exercise.type.substring(0, 4)}</P>
                        </Div>

                        <Div className="flex-1 gap-2">
                            <Row className="items-start">
                                <Div className="flex-1">
                                    <Row className="items-center gap-2">
                                        <P className="text-lg font-bold">{exercise.name}</P>
                                        <Badge variant={completed ? "success" : "outline"}>{completed ? "Completed" : `${completedSets}/${targetSets}`}</Badge>
                                    </Row>
                                    <P className="text-muted-foreground mt-1 text-sm">{targetSummary}</P>
                                </Div>
                            </Row>
                        </Div>
                        {isExpanded ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
                    </Div>
                </Row>
            </Div>
        </Button>
    );
}

function WorkoutProgress({ completed, progressPercent }: Pick<SubComponentProps, "completed" | "progressPercent">) {
    return (
        <Div className="gap-2">
            <Row>
                <P className="text-muted-foreground text-xs uppercase">Workout progress</P>
                <P className={cn("text-xs", completed ? "text-success" : "text-muted-foreground")}>{progressPercent}%</P>
            </Row>
            <Div className="h-2.5 overflow-hidden rounded-full bg-zinc-950/10">
                <Div className={cn("h-full rounded-full", completed ? "bg-success" : "bg-primary")} style={{ width: `${progressPercent}%` }} />
            </Div>
        </Div>
    );
}

function MetricChips({ bestAverage, pacing, suggestedLoad, exercise }: Pick<SubComponentProps, "bestAverage" | "pacing" | "suggestedLoad" | "exercise">) {
    return (
        <Row className="gap-4">
            <MetricChip label="Best avg" value={bestAverage} />
            <MetricChip label="Rep pace" value={pacing} />
            <MetricChip label="Next cue" value={suggestedLoad ? `${suggestedLoad}${exercise.unit ?? "kg"}` : exercise.type === "Cardio" ? "Hold pace" : "Stable"} />
        </Row>
    );
}

function InfoCards({ completedSets, targetSets, suggestedLoad, exercise }: Pick<SubComponentProps, "completedSets" | "targetSets" | "suggestedLoad" | "exercise">) {
    return (
        <Row className="items-start gap-3">
            <Div className="bg-muted/50 flex-1 rounded-3xl px-4 py-4">
                <P className="text-muted-foreground text-[10px] uppercase">Current set</P>
                <H3 className="mt-1">
                    {Math.min(completedSets + 1, targetSets)} / {targetSets}
                </H3>
                <P className="text-muted-foreground mt-1 text-sm">Move through the block one clean set at a time.</P>
            </Div>

            <Div className="flex-1 rounded-3xl bg-[#FFF3DE] px-4 py-4">
                <P className="text-muted-foreground text-[10px] uppercase">Next session cue</P>
                <H3 className="text-primary mt-1">{suggestedLoad ? `${suggestedLoad}${exercise.unit ?? "kg"}` : exercise.type === "Cardio" ? "Keep pace" : "Stay steady"}</H3>
                <P className="text-muted-foreground mt-1 text-sm">Suggested from your current logged trend.</P>
            </Div>
        </Row>
    );
}

function Cardio({ exercise, weight, setWeight, reps, setReps, isReadOnly, type }: Pick<SubComponentProps, "exercise" | "weight" | "setWeight" | "reps" | "setReps" | "isReadOnly" | "type">) {
    if (type !== "Cardio") return null;

    return (
        <Row className="gap-3">
            <Div className="flex-1">
                <Label className="text-xs font-extrabold uppercase">Distance ({exercise.unit ?? "km"})</Label>
                <Input className="h-14 rounded-2xl" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} placeholder={exercise.distance?.toString() ?? "5"} editable={!isReadOnly} />
            </Div>
            <Div className="flex-1">
                <Label className="text-xs font-extrabold uppercase">Duration (min)</Label>
                <Input className="h-14 rounded-2xl" keyboardType="number-pad" value={reps} onChangeText={setReps} placeholder={exercise.duration?.toString() ?? "30"} editable={!isReadOnly} />
            </Div>
        </Row>
    );
}

function Weight({ exercise, weight, setWeight, reps, setReps, isReadOnly, type }: Pick<SubComponentProps, "exercise" | "weight" | "setWeight" | "reps" | "setReps" | "isReadOnly" | "type">) {
    if (type === "Cardio") return null;

    return (
        <Row className="gap-3">
            <Div className="flex-1">
                <Label className="text-xs font-extrabold uppercase">Weight ({exercise.unit ?? "kg"})</Label>
                <Input className="h-14 rounded-2xl" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} editable={!isReadOnly} />
            </Div>
            <Div className="flex-1">
                <Label className="text-xs font-extrabold uppercase">Reps done</Label>
                <Input className="h-14 rounded-2xl" keyboardType="number-pad" value={reps} onChangeText={setReps} editable={!isReadOnly} />
            </Div>
        </Row>
    );
}

function MetricChip({ label, value }: { label: string; value: string }) {
    return (
        <Div className="bg-muted/45 flex-1 rounded-[20px] px-3 py-3">
            <P className="text-muted-foreground text-[10px] uppercase">{label}</P>
            <P className="mt-1 text-sm">{value}</P>
        </Div>
    );
}
