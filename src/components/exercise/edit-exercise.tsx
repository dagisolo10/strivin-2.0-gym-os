import { Button } from "../ui/interactive";
import { Card, Div, H3, Row } from "../ui/display";
import { CoreWeightToggleField, DayAssignmentField, DurationField, ExerciseNameField, SetsAndRepsFields, TypeField, UnitAndValueField, VariantField } from "./exercise-form-fields";

import { z } from "zod";
import { exerciseSchema } from "@/db/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-native-sonner";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateExerciseGroup } from "@/server/exercise";

type EditExerciseFormValues = z.input<typeof exerciseSchema>;

interface EditExerciseProps {
    exercise: {
        localId: string;
        name: string;
        type: ExerciseType;
        variant: ExerciseVariant;
        sets?: number | null;
        reps?: number | null;
        weight?: number | null;
        distance?: number | null;
        duration?: number | null;
        unit?: Unit | null;
        usesWeight?: boolean;
    };
    exerciseIds: string[];
    workoutDays: Weekday[];
    availableDays: Weekday[];
    userId: string;
    planId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function EditExercise({ exercise, exerciseIds, workoutDays, availableDays, userId, planId, onSuccess, onCancel }: EditExerciseProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<EditExerciseFormValues>({
        resolver: zodResolver(exerciseSchema),
        defaultValues: {
            name: exercise.name,
            type: exercise.type,
            variant: exercise.variant,
            workoutDays,
            sets: exercise.sets ?? undefined,
            reps: exercise.reps ?? undefined,
            weight: exercise.weight ?? undefined,
            distance: exercise.distance ?? undefined,
            duration: exercise.duration ?? undefined,
            unit: exercise.unit ?? undefined,
            usesWeight: exercise.usesWeight ?? !(exercise.type === "Core" && !exercise.weight),
        },
    });

    const selectedType = form.watch("type");
    const usesWeight = form.watch("usesWeight") ?? (selectedType === "Cardio" || selectedType === "Core" ? false : true);
    const previousTypeRef = useRef<string>("");

    const isCardio = selectedType === "Cardio";
    const isCore = selectedType === "Core";

    useEffect(() => {
        if (selectedType === "Core" && previousTypeRef.current !== "Core") {
            form.setValue("usesWeight", false);
        }
        previousTypeRef.current = selectedType ?? "";
    }, [form, selectedType]);

    useEffect(() => {
        if (!selectedType) return;

        if (isCardio) {
            form.resetField("sets");
            form.resetField("reps");
            form.resetField("weight");
            form.setValue("usesWeight", false);
            if (!["km", "mi"].includes(String(form.getValues("unit") ?? ""))) form.setValue("unit", "km");
        } else {
            form.resetField("duration");
            form.resetField("distance");
            if (selectedType !== "Core") {
                form.setValue("usesWeight", true);
            }
            if ((selectedType !== "Core" || usesWeight) && !["kg", "lb"].includes(String(form.getValues("unit") ?? ""))) {
                form.setValue("unit", "kg");
            }
            if (selectedType === "Core" && !usesWeight) {
                form.resetField("weight");
                form.resetField("unit");
            }
        }
    }, [form, isCardio, selectedType, usesWeight]);

    const handleSubmit = async (data: EditExerciseFormValues) => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const result = await updateExerciseGroup({
                exerciseIds,
                userId,
                planId,
                workoutDays: data.workoutDays as Weekday[],
                exercise: {
                    name: data.name,
                    type: data.type as ExerciseType,
                    variant: data.variant as ExerciseVariant,
                    sets: data.sets,
                    reps: data.reps,
                    weight: data.weight,
                    distance: data.distance,
                    duration: data.duration,
                    unit: (data.unit as Unit | undefined) ?? null,
                    usesWeight: data.usesWeight,
                },
            });

            if (result.success) {
                toast.success("Success: Exercise updated", { description: `${data.name} has been updated successfully.` });
                onSuccess?.();
            } else {
                toast.error("Error: Failed to update exercise", { description: result.error || "Please try again." });
            }
        } catch {
            toast.error("Error: An unexpected error occurred", { description: "Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="gap-4">
            <Row className="items-center justify-between">
                <H3>Edit Exercise</H3>
                <Button variant="ghost" size="sm" onPress={onCancel}>
                    Cancel
                </Button>
            </Row>

            <Div className="gap-4">
                <ExerciseNameField control={form.control} />
                <TypeField control={form.control} />
                <VariantField control={form.control} />
                <DayAssignmentField control={form.control} availableDays={availableDays} />

                {isCardio ? <DurationField control={form.control} /> : <SetsAndRepsFields control={form.control} />}

                {isCore ? <CoreWeightToggleField control={form.control} /> : null}
                <UnitAndValueField control={form.control} isCardio={isCardio} showWeight={!isCardio && usesWeight} />
            </Div>

            <Row className="gap-3">
                <Button variant="outline" onPress={onCancel} className="flex-1">
                    Cancel
                </Button>
                <Button onPress={form.handleSubmit(handleSubmit)} className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Exercise"}
                </Button>
            </Row>
        </Card>
    );
}
