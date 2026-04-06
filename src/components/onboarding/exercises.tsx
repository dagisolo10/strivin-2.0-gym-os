import { Button } from "../ui/interactive";
import { Badge, Card, Div, P, Row } from "../ui/display";
import { DayAssignmentField, DurationField, ExerciseNameField, SetsAndRepsFields, TypeField, UnitAndValueField, VariantField } from "../exercise/exercise-form-fields";

import { Exercise } from "@/types/model";
import { getTemplate } from "@/constants/templates";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

export default function Exercises() {
    const { split, workoutDays } = useOnboardingStore();
    const { control } = useFormContext();
    const { fields: exercises, append: appendEx, remove: removeEx } = useFieldArray({ control, name: "exercises" });

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
            {exercises.length === 0 && <EmptyState action={appendEx} onAddCustom={getCustomDefault} split={split} />}

            {exercises.map((_: any, index) => (
                <ExerciseCard key={_.id} index={index} control={control} split={split} workoutDays={workoutDays} removeEx={removeEx} />
            ))}

            {exercises.length > 0 ? (
                <Row className="gap-3">
                    <Button variant="outline" className="flex-1 px-4" onPress={() => appendEx(getCustomDefault(split))}>
                        Add Custom
                    </Button>
                    <Button variant="secondary" className="flex-1 px-4" onPress={() => appendEx(getTemplate(split)[0])}>
                        Add Template Move
                    </Button>
                </Row>
            ) : null}
        </Div>
    );
}

function ExerciseCard({ index, control, split, workoutDays, removeEx }: any) {
    const currentType = useWatch({ control, name: `exercises.${index}.type` });
    const isCardio = currentType === "Cardio";

    return (
        <Card className="gap-5">
            <Row>
                <Badge variant={"outline"}>Exercise {index + 1}</Badge>
                <Button onPress={() => removeEx(index)} variant="outline" size="sm" textClassName="text-destructive">
                    Remove
                </Button>
            </Row>

            <ExerciseNameField control={control} index={index} placeholder={split === "Endurance" ? "e.g. Steady State Run" : "e.g. Bench Press"} />
            <DayAssignmentField control={control} index={index} availableDays={workoutDays} />
            <TypeField control={control} index={index} />
            <VariantField control={control} index={index} />
            <UnitAndValueField control={control} index={index} isCardio={isCardio} />
            {isCardio ? <DurationField control={control} index={index} /> : <SetsAndRepsFields control={control} index={index} />}
        </Card>
    );
}

interface AddEmptyProps {
    action: (data: any) => void;
    onAddCustom: (split: WorkoutSplit) => Partial<Exercise>;
    split: WorkoutSplit;
}

function EmptyState({ action, onAddCustom, split }: AddEmptyProps) {
    return (
        <Card className="items-center gap-4 p-8">
            <Badge variant="outline">Routine Builder</Badge>
            <P className="text-center text-lg">Start from scratch or drop in a template and edit it.</P>
            <P className="text-muted-foreground text-center text-sm">Everything stays local and editable after onboarding.</P>
            <Row className="gap-4">
                <Button onPress={() => action(onAddCustom(split))} variant="outline" className="flex-1">
                    Add Custom
                </Button>
                <Button onPress={() => action(getTemplate(split))} variant="secondary" className="flex-1">
                    Use Template
                </Button>
            </Row>
        </Card>
    );
}
