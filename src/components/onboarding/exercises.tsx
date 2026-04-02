import { Button, Input } from "../ui/button";
import { Div, P, Card, Row, Label } from "../ui/view";

import { cn } from "@/lib/utils";
import { DAY_ORDER } from "@/constants/data";
import { getTemplate } from "@/constants/templates";
import { Exercise, WorkoutSplit } from "@/types/interface";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { Control, Controller, FieldValues, useFieldArray, useFormContext } from "react-hook-form";

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

    const getCustomDefault = (split: WorkoutSplit): Partial<Exercise> => {
        const isEndurance = split === "Endurance";
        return {
            name: "",
            type: isEndurance ? "Cardio" : "Push",
            variant: isEndurance ? "Endurance" : "Upper",
            unit: isEndurance ? "km" : "kg",
            sets: isEndurance ? undefined : 0,
            reps: isEndurance ? undefined : 0,
            weight: isEndurance ? undefined : 0,
            distance: isEndurance ? 0 : undefined,
            duration: isEndurance ? 0 : undefined,
        };
    };

    return (
        <Div className="gap-6">
            <AddCustom length={exercises.length} action={appendEx} onAddCustom={getCustomDefault} onAddTemplate={getTemplate} split={split} />

            {exercises.length > 0 &&
                exercises.map((exercise: any, index) => (
                    <Card key={exercise.id} className="relative gap-4 p-5">
                        <Name control={control} split={split} index={index} onPress={removeEx} />

                        <DistanceUnit type={exercise.type} control={control} index={index} onChangeText={handleNumberChange} />
                        <SetsAndRep type={exercise.type} control={control} index={index} onChangeText={handleNumberChange} />

                        <Duration type={exercise.type} control={control} index={index} onChangeText={handleNumberChange} />
                        <WeightUnit type={exercise.type} control={control} index={index} onChangeText={handleNumberChange} />

                        <DayAssignment control={control} index={index} workoutDays={workoutDays} />
                        <Type control={control} index={index} />
                        <Variant control={control} index={index} />
                    </Card>
                ))}

            <AddExercise length={exercises.length} onAppend={getCustomDefault} action={appendEx} split={split} />
        </Div>
    );
}

function DayAssignment({ control, index, workoutDays }: All & { workoutDays: string[] }) {
    return (
        <Div>
            <Label>Perform on:</Label>
            <Row className="gap-2">
                <Controller
                    name={`exercises.${index}.workoutDays`}
                    control={control}
                    defaultValue={workoutDays}
                    render={({ field: { value = [], onChange }, fieldState: { error } }) => (
                        <Div className="flex-1">
                            <Row className="flex-wrap gap-2">
                                {workoutDays
                                    .sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b])
                                    .map((day) => {
                                        const isSelected = value.includes(day);
                                        return (
                                            <Button
                                                key={day}
                                                variant={isSelected ? "primary" : "outline"}
                                                className={cn(workoutDays.length > 3 ? "w-30" : "flex-1")}
                                                onPress={() => {
                                                    const next = isSelected ? value.filter((d: string) => d !== day) : [...value, day];
                                                    onChange(next);
                                                }}>
                                                <P className={isSelected ? "text-white" : "text-zinc-400"}>{day.substring(0, 3)}</P>
                                            </Button>
                                        );
                                    })}
                            </Row>
                            {error && <Label className="text-destructive">{error.message}</Label>}
                        </Div>
                    )}
                />
            </Row>
        </Div>
    );
}

function AddExercise({ length, onAppend, action, split }: AddExProp) {
    if (length === 0) return null;

    return (
        <Button variant="outline" onPress={() => action(onAppend(split))}>
            + Add More Exercises
        </Button>
    );
}

function AddCustom({ action, onAddCustom, onAddTemplate, split, length }: AddCustomProp) {
    if (length > 0) return null;

    return (
        <Div className="items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 p-10">
            <P className="mb-4 text-center text-zinc-400">Empty routine. Start fresh or use a starter pack.</P>
            <Div className="gap-3">
                <Button onPress={() => action(onAddCustom(split))} variant="secondary">
                    + Add Custom
                </Button>
                <Button onPress={() => action(onAddTemplate(split))} variant="primary">
                    Use Template for {split}
                </Button>
            </Div>
        </Div>
    );
}

function Name({ control, split, index, onPress }: ControlProp) {
    return (
        <Row className="items-end gap-4">
            <Div className="flex-1">
                <Label>Exercise Name</Label>
                <Controller
                    name={`exercises.${index}.name`}
                    control={control}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <>
                            <Input value={value} onChangeText={onChange} placeholder={split === "Endurance" ? "e.g. Steady State Run" : "e.g. Bench Press"} />
                            {error && <Label className="text-destructive">{error.message}</Label>}
                        </>
                    )}
                />
            </Div>
            <Button onPress={() => onPress(index)} variant="outline" size="sm" textClassName="text-red-400">
                Remove
            </Button>
        </Row>
    );
}

function DistanceUnit({ control, index, onChangeText, type }: ChangeProp) {
    if (type !== "Cardio") return null;

    return (
        <Div>
            <Label>Target Distance</Label>
            <Row className="gap-3">
                <Controller
                    name={`exercises.${index}.distance`}
                    control={control}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <>
                            <Input className="flex-1" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(v) => onChangeText(v, onChange)} placeholder="km/mi" />
                            {error && <Label className="text-destructive">{error.message}</Label>}
                        </>
                    )}
                />

                <Controller
                    name={`exercises.${index}.unit`}
                    control={control}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <>
                            <Row className="gap-2">
                                {["km", "mi"].map((unit) => (
                                    <Button key={unit} variant={value === unit ? "primary" : "outline"} size="icon" onPress={() => onChange(unit)}>
                                        <P className={cn(value === unit ? "text-white" : "text-zinc-400")}>{unit}</P>
                                    </Button>
                                ))}
                            </Row>
                            {error && <Label className="text-destructive">{error.message}</Label>}
                        </>
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
                            <Input keyboardType="number-pad" value={value?.toString()} onChangeText={(v) => onChangeText(v, onChange)} />
                            {error && <Label className="text-destructive">{error.message}</Label>}
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
                            <Input keyboardType="number-pad" value={value?.toString()} onChangeText={(v) => onChangeText(v, onChange)} />
                            {error && <Label className="text-destructive">{error.message}</Label>}
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
                        <Input keyboardType="decimal-pad" value={value?.toString()} onChangeText={(v) => onChangeText(v, onChange)} placeholder="Time" />
                        {error && <Label className="text-destructive">{error.message}</Label>}
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
                        <>
                            <Input className="flex-1" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(v) => onChangeText(v, onChange)} />
                            {error && <Label className="text-destructive">{error.message}</Label>}
                        </>
                    )}
                />
                <Controller
                    name={`exercises.${index}.unit`}
                    control={control}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <>
                            <Row className="gap-2">
                                {["kg", "lb"].map((unit) => (
                                    <Button key={unit} variant={value === unit ? "primary" : "outline"} size="icon" onPress={() => onChange(unit)}>
                                        <P className={cn(value === unit ? "text-white" : "text-zinc-400")}>{unit}</P>
                                    </Button>
                                ))}
                            </Row>
                            {error && <Label className="text-destructive">{error.message}</Label>}
                        </>
                    )}
                />
            </Row>
        </Div>
    );
}

function Type({ control, index }: All) {
    return (
        <Div className="flex-1">
            <Label>Type</Label>
            <Controller
                name={`exercises.${index}.type`}
                control={control}
                render={({ field: { value, onChange } }) => (
                    <Div className="gap-2">
                        {["Push", "Pull", "Legs", "Core", "Cardio"].map((type) => (
                            <Button className="w-full" key={type} variant={value === type ? "primary" : "outline"} onPress={() => onChange(type)}>
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
        <Div className="flex-1">
            <Label>Variant</Label>
            <Controller
                name={`exercises.${index}.variant`}
                control={control}
                render={({ field: { value, onChange } }) => (
                    <Div className="row flex-wrap justify-evenly gap-2">
                        {["Upper", "Lower", "Endurance"].map((type) => (
                            <Button className="flex-1 px-0" key={type} variant={value === type ? "primary" : "outline"} onPress={() => onChange(type)}>
                                {type}
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
    onPress: (index: number) => void;
}

interface ChangeProp extends All {
    onChangeText: (value: string, onChange: (val: number | string) => void) => void;
    type: string;
}

interface AddCustomProp {
    onAddCustom: (split: WorkoutSplit) => Partial<Exercise>;
    onAddTemplate: (split: WorkoutSplit) => Partial<Exercise>[];
    action: (value: Partial<Exercise> | Partial<Exercise>[]) => void;
    split: WorkoutSplit;
    length: number;
}

interface AddExProp {
    length: number;
    action: (value: Partial<Exercise>) => void;
    onAppend: (split: WorkoutSplit) => Partial<Exercise>;
    split: WorkoutSplit;
}
