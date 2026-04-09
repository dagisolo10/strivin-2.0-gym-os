import { Button } from "../ui/interactive";
import { Badge, Card, Div, P, Row } from "../ui/display";
import { CoreWeightToggleField, DayAssignmentField, DurationField, ExerciseNameField, SetsAndRepsFields, TypeField, UnitAndValueField, VariantField, } from "../exercise/exercise-form-fields";

import { useEffect, useRef } from "react";
import { getTemplate } from "@/constants/templates";
import { Exercise, ExerciseWithUsesWeight } from "@/types/types";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

export default function Exercises() {
    const { split, workoutDays } = useOnboardingStore();
    const { control } = useFormContext();
    const { fields: exercises, append: appendEx, remove: removeEx } = useFieldArray({ control, name: "exercises" });

    const getCustomDefault = (currentSplit: WorkoutSplit): Partial<ExerciseWithUsesWeight> => {
        const isEndurance = currentSplit === "Endurance";
        const type = isEndurance ? "Cardio" : "Push";
        return {
            name: "",
            type: type,
            variant: isEndurance ? "Endurance" : "Upper",
            unit: isEndurance ? "km" : "kg",
            usesWeight: type === "Cardio" || type === "Push" ? false : true,
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
    const usesWeight = useWatch({ control, name: `exercises.${index}.usesWeight` }) ?? (currentType === "Cardio" || currentType === "Core" ? false : true);
    const isCardio = currentType === "Cardio";
    const isCore = currentType === "Core";
    const previousTypeRef = useRef<string>("");
    const { setValue, resetField, getValues } = useFormContext();

    const isBodyweight = !usesWeight;

    useEffect(() => {
        if (currentType === "Core" && previousTypeRef.current !== "Core") {
            setValue(`exercises.${index}.usesWeight`, false);
        }
        previousTypeRef.current = currentType ?? "";
    }, [currentType, index, setValue]);

    useEffect(() => {
        if (!currentType) return;

        if (isCardio) {
            resetField(`exercises.${index}.sets`);
            resetField(`exercises.${index}.reps`);
            resetField(`exercises.${index}.weight`);
            setValue(`exercises.${index}.usesWeight`, false);
            if (!["km", "mi"].includes(String(getValues(`exercises.${index}.unit`) ?? ""))) {
                setValue(`exercises.${index}.unit`, "km");
            }
            return;
        }

        resetField(`exercises.${index}.duration`);
        resetField(`exercises.${index}.distance`);

        if (currentType !== "Core") {
            setValue(`exercises.${index}.usesWeight`, true);
        }

        if (currentType === "Core" && !usesWeight) {
            resetField(`exercises.${index}.weight`);
            resetField(`exercises.${index}.unit`);
            return;
        }

        if (!["kg", "lb"].includes(String(getValues(`exercises.${index}.unit`) ?? ""))) {
            setValue(`exercises.${index}.unit`, "kg");
        }
    }, [currentType, getValues, index, isCardio, resetField, setValue, usesWeight]);

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
            {isCardio ? <DurationField control={control} index={index} /> : <SetsAndRepsFields control={control} index={index} />}
            {isCore ? <CoreWeightToggleField control={control} index={index} /> : null}
            <UnitAndValueField control={control} index={index} isCardio={isCardio} showWeight={!isBodyweight} />
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