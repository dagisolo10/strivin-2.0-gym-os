import { Button, Input } from "../ui/button";
import { Badge, Card, Div, Label, P, Row } from "../ui/view";

import { cn } from "@/lib/utils";
import { Exercise } from "@/types/model";
import { DAY_ORDER } from "@/constants/data";
import { getTemplate } from "@/constants/templates";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { Control, Controller, FieldValues, useFieldArray, useFormContext, useWatch } from "react-hook-form";

export default function Exercises() {
    const { split, workoutDays } = useOnboardingStore();
    const { control } = useFormContext();
    const { fields: exercises, append: appendEx, remove: removeEx } = useFieldArray({ control, name: "exercises" });

    const handleNumberChange = (value: string, onChange: (val: number | string) => void) => {
        if (value === "" || value === ".") return onChange(0);
        if (value.endsWith(".")) return onChange(value);
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) onChange(parsed);
    };

    const getCustomDefault = (currentSplit: WorkoutSplit): Partial<Exercise> => {
        const isEndurance = currentSplit === "Endurance";
        return {
            name: "",
            type: isEndurance ? "Cardio" : "Push",
            variant: isEndurance ? "Endurance" : "Upper",
            unit: isEndurance ? "km" : "kg",
            sets: isEndurance ? undefined : 3,
            reps: isEndurance ? undefined : 12,
            weight: isEndurance ? undefined : 10,
            distance: isEndurance ? 5 : undefined,
            duration: isEndurance ? 30 : undefined,
        };
    };

    return (
        <Div className="gap-5">
            {exercises.length === 0 ? <EmptyState action={appendEx} onAddCustom={getCustomDefault} split={split} /> : null}

            {exercises.map((exercise: any, index) => (
                <ExerciseCard key={exercise.id} exercise={exercise} index={index} control={control} split={split} workoutDays={workoutDays} removeEx={removeEx} handleNumberChange={handleNumberChange} />
            ))}

            {exercises.length > 0 ? (
                <Row className="gap-3">
                    <Button variant="outline" className="flex-1 rounded-2xl" onPress={() => appendEx(getCustomDefault(split))}>
                        Add Custom
                    </Button>
                    <Button variant="secondary" className="flex-1 rounded-2xl" onPress={() => appendEx(getTemplate(split)[0])}>
                        Add Template Move
                    </Button>
                </Row>
            ) : null}
        </Div>
    );
}

function ExerciseCard({ exercise, index, control, split, workoutDays, removeEx, handleNumberChange }: any) {
    const currentType = useWatch({ control, name: `exercises.${index}.type`, defaultValue: exercise.type });

    return (
        <Card className="bg-background/50 gap-4 rounded-4xl border-0 p-5">
            <Row>
                <Badge variant="outline">Exercise {index + 1}</Badge>
                <Button onPress={() => removeEx(index)} variant="outline" size="sm" textClassName="text-destructive">
                    Remove
                </Button>
            </Row>

            <ExerciseName control={control} split={split} index={index} />
            <DayAssignment control={control} index={index} workoutDays={workoutDays} />
            <Type control={control} index={index} />
            <Variant control={control} index={index} />
            <DistanceUnit type={currentType} control={control} index={index} onChangeText={handleNumberChange} />
            <SetsAndRep type={currentType} control={control} index={index} onChangeText={handleNumberChange} />
            <Duration type={currentType} control={control} index={index} onChangeText={handleNumberChange} />
            <WeightUnit type={currentType} control={control} index={index} onChangeText={handleNumberChange} />
        </Card>
    );
}

function EmptyState({ action, onAddCustom, split }: AddEmptyProps) {
    return (
        <Card className="bg-muted/50 items-center gap-4 rounded-[28px] border-0 px-6 py-8">
            <Badge variant="outline">Routine Builder</Badge>
            <P className="text-center text-lg">Start from scratch or drop in a template and edit it.</P>
            <P className="text-muted-foreground text-center text-sm">Everything stays local and editable after onboarding.</P>
            <Row className="gap-3">
                <Button onPress={() => action(onAddCustom(split))} variant="outline" className="rounded-2xl">
                    Add Custom
                </Button>
                <Button onPress={() => action(getTemplate(split))} variant="secondary" className="rounded-2xl">
                    Use Template
                </Button>
            </Row>
        </Card>
    );
}

function ExerciseName({ control, split, index }: ControlProp) {
    return (
        <Div>
            <Label>Exercise Name</Label>
            <Controller
                name={`exercises.${index}.name`}
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <>
                        <Input value={value} onChangeText={onChange} placeholder={split === "Endurance" ? "e.g. Steady State Run" : "e.g. Bench Press"} className="h-14 rounded-2xl text-base" />
                        {error ? <P className="text-destructive text-sm">{error.message}</P> : null}
                    </>
                )}
            />
        </Div>
    );
}

function DayAssignment({ control, index, workoutDays }: All & { workoutDays: Weekday[] }) {
    return (
        <Div>
            <Label>Perform On</Label>
            <Controller
                name={`exercises.${index}.workoutDays`}
                control={control}
                defaultValue={[]}
                render={({ field: { value = [], onChange }, fieldState: { error } }) => (
                    <>
                        <Div className="row flex-wrap gap-3">
                            {workoutDays
                                .sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b])
                                .map((day) => (
                                    <Button
                                        key={day}
                                        variant={value.includes(day) ? "secondary" : "outline"}
                                        className={cn("min-w-21 flex-1 rounded-2xl px-4")}
                                        onPress={() => {
                                            const next = value.includes(day) ? value.filter((d: string) => d !== day) : [...value, day];
                                            onChange(next);
                                        }}>
                                        {day.slice(0, 3)}
                                    </Button>
                                ))}
                        </Div>
                        {error ? <P className="text-destructive text-sm">{error.message}</P> : null}
                    </>
                )}
            />
        </Div>
    );
}

function DistanceUnit({ control, index, onChangeText, type }: ChangeProp) {
    if (type !== "Cardio") return null;

    return (
        <Div>
            <Label>Distance</Label>
            <Row className="gap-3">
                <Controller
                    name={`exercises.${index}.distance`}
                    control={control}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <Div className="flex-1 gap-2">
                            <Input className="rounded-2xl text-base" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(v) => onChangeText(v, onChange)} placeholder="5" />
                            {error ? <P className="text-destructive text-sm">{error.message}</P> : null}
                        </Div>
                    )}
                />

                <Controller
                    name={`exercises.${index}.unit`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <Row className="gap-2">
                            {["km", "mi"].map((unit) => (
                                <Button key={unit} variant={value === unit ? "secondary" : "outline"} size="icon" onPress={() => onChange(unit)}>
                                    {unit}
                                </Button>
                            ))}
                        </Row>
                    )}
                />
            </Row>
        </Div>
    );
}

function SetsAndRep({ control, index, onChangeText, type }: ChangeProp) {
    if (type === "Cardio") return null;

    return (
        <Row className="gap-4">
            <Div className="flex-1">
                <Label>Sets</Label>
                <Controller
                    name={`exercises.${index}.sets`}
                    control={control}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <>
                            <Input className="rounded-2xl text-base" keyboardType="number-pad" value={value?.toString()} onChangeText={(v) => onChangeText(v, onChange)} />
                            {error ? <P className="text-destructive text-sm">{error.message}</P> : null}
                        </>
                    )}
                />
            </Div>

            <Div className="flex-1">
                <Label>Reps</Label>
                <Controller
                    name={`exercises.${index}.reps`}
                    control={control}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <>
                            <Input className="rounded-2xl text-base" keyboardType="number-pad" value={value?.toString()} onChangeText={(v) => onChangeText(v, onChange)} />
                            {error ? <P className="text-destructive text-sm">{error.message}</P> : null}
                        </>
                    )}
                />
            </Div>
        </Row>
    );
}

function Duration({ control, index, onChangeText, type }: ChangeProp) {
    if (type !== "Cardio") return null;

    return (
        <Div>
            <Label>Duration (mins)</Label>
            <Controller
                name={`exercises.${index}.duration`}
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <>
                        <Input className="rounded-2xl text-base" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(v) => onChangeText(v, onChange)} placeholder="30" />
                        {error ? <P className="text-destructive text-sm">{error.message}</P> : null}
                    </>
                )}
            />
        </Div>
    );
}

function WeightUnit({ control, index, onChangeText, type }: ChangeProp) {
    if (type === "Cardio") return null;

    return (
        <Div>
            <Label>Starting Weight</Label>
            <Row className="gap-3">
                <Controller
                    name={`exercises.${index}.weight`}
                    control={control}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <Div className="flex-1 gap-2">
                            <Input className="rounded-2xl text-base" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(v) => onChangeText(v, onChange)} placeholder="20" />
                            {error ? <P className="text-destructive text-sm">{error.message}</P> : null}
                        </Div>
                    )}
                />
                <Controller
                    name={`exercises.${index}.unit`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <Row className="gap-2">
                            {["kg", "lb"].map((unit) => (
                                <Button key={unit} variant={value === unit ? "secondary" : "outline"} size="icon" onPress={() => onChange(unit)}>
                                    {unit}
                                </Button>
                            ))}
                        </Row>
                    )}
                />
            </Row>
        </Div>
    );
}

function Type({ control, index }: All) {
    return (
        <Div>
            <Label>Type</Label>
            <Controller
                name={`exercises.${index}.type`}
                control={control}
                render={({ field: { value, onChange } }) => (
                    <Div className="row flex-wrap gap-2">
                        {(["Push", "Pull", "Legs", "Core", "Cardio"] as const).map((type) => (
                            <Button className="min-w-24 flex-1 rounded-2xl px-4" key={type} variant={value === type ? "secondary" : "outline"} onPress={() => onChange(type)}>
                                {type}
                            </Button>
                        ))}
                    </Div>
                )}
            />
        </Div>
    );
}

function Variant({ control, index }: All) {
    return (
        <Div>
            <Label>Variant</Label>
            <Controller
                name={`exercises.${index}.variant`}
                control={control}
                render={({ field: { value, onChange } }) => (
                    <Div className="row flex-wrap gap-2">
                        {(["Upper", "Lower", "Endurance", "Full Body"] as const).map((variant) => (
                            <Button className="flex-1 rounded-2xl px-4" key={variant} variant={value === variant ? "secondary" : "outline"} onPress={() => onChange(variant)}>
                                {variant}
                            </Button>
                        ))}
                    </Div>
                )}
            />
        </Div>
    );
}

interface All {
    control: Control<FieldValues, any, FieldValues>;
    index: number;
}

interface ControlProp extends All {
    split: string;
}

interface ChangeProp extends All {
    onChangeText: (value: string, onChange: (val: number | string) => void) => void;
    type: string;
}

interface AddEmptyProps {
    action: (value: Partial<Exercise> | Partial<Exercise>[]) => void;
    onAddCustom: (split: WorkoutSplit) => Partial<Exercise>;
    split: WorkoutSplit;
}
