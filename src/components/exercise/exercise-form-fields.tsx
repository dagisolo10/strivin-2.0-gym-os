import { ErrorMessage } from "../ui/screen-ui";
import { Button, Input } from "../ui/interactive";
import { Div, Field, P, Row } from "../ui/display";

import React from "react";
import { cn } from "@/lib/utils";
import { Controller } from "react-hook-form";
import { DAY_ORDER, DISTANCE_UNITS, TYPES, VARIANTS, WEIGHT_UNITS, weekdays } from "@/constants/data";

interface BaseFieldProps {
    control: any;
    index?: number;
    namePrefix?: string;
}

const getFieldName = (name: string, index?: number, namePrefix?: string) => {
    if (namePrefix) return `${namePrefix}.${name}`;
    if (index !== undefined) return `exercises.${index}.${name}`;
    return name;
};

export const ExerciseNameField = ({ control, index, namePrefix, placeholder }: BaseFieldProps & { placeholder?: string }) => (
    <Field label="Exercise Name">
        <Controller
            control={control}
            name={getFieldName("name", index, namePrefix)}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Div>
                    <Input
                        className={cn(error && "border-destructive")}
                        placeholder={placeholder || "e.g. Incline Bench Press"}
                        value={value}
                        onChangeText={onChange}
                    />
                    <ErrorMessage message={error?.message} />
                </Div>
            )}
        />
    </Field>
);

export const TypeField = ({ control, index, namePrefix }: BaseFieldProps) => (
    <Field label="Movement Type">
        <Controller
            name={getFieldName("type", index, namePrefix)}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
                <Div className="row flex-wrap gap-2">
                    {TYPES.map((type) => {
                        const isSelected = value === type;
                        return (
                            <Button
                                key={type}
                                onPress={() => onChange(type)}
                                variant={isSelected ? "secondary" : "outline"}
                                className={cn("min-w-24 flex-1", error && !isSelected && "border-destructive")}
                                textClassName={isSelected ? "text-background" : "text-muted-foreground"}>
                                {type}
                            </Button>
                        );
                    })}
                </Div>
            )}
        />
    </Field>
);

export const VariantField = ({ control, index, namePrefix }: BaseFieldProps) => (
    <Field label="Variant">
        <Controller
            name={getFieldName("variant", index, namePrefix)}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
                <Div className="row flex-wrap gap-2">
                    {VARIANTS.map((variant) => (
                        <Button
                            key={variant}
                            onPress={() => onChange(variant)}
                            variant={value === variant ? "secondary" : "outline"}
                            textClassName={value === variant ? "text-background" : "text-muted-foreground"}
                            className={cn(error && "border-destructive", "min-w-24 flex-1 px-5")}>
                            {variant}
                        </Button>
                    ))}
                </Div>
            )}
        />
    </Field>
);

export const DayAssignmentField = ({
    control,
    index,
    namePrefix,
    availableDays = weekdays as unknown as Weekday[],
}: BaseFieldProps & { availableDays?: Weekday[] }) => (
    <Field label="Perform On">
        <Controller
            name={getFieldName("workoutDays", index, namePrefix)}
            control={control}
            render={({ field: { value = [], onChange }, fieldState: { error } }) => (
                <Div>
                    <Div className="row flex-wrap gap-3">
                        {[...availableDays]
                            .sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b])
                            .map((day) => (
                                <Button
                                    key={day}
                                    variant={value.includes(day) ? "secondary" : "outline"}
                                    textClassName={value.includes(day) ? "text-background" : "text-muted-foreground"}
                                    className={cn(error && "border-destructive", "min-w-28 flex-1 px-3")}
                                    onPress={() => {
                                        const next = value.includes(day) ? value.filter((d: string) => d !== day) : [...value, day];
                                        onChange(next);
                                    }}>
                                    {day}
                                </Button>
                            ))}
                    </Div>
                    <ErrorMessage message={error?.message} />
                </Div>
            )}
        />
    </Field>
);

export const SetsAndRepsFields = ({ control, index, namePrefix }: BaseFieldProps) => (
    <Row className="items-start gap-4">
        <Field label="Sets" className="flex-1">
            <Controller
                name={getFieldName("sets", index, namePrefix)}
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <Div>
                        <Input keyboardType="number-pad" value={value?.toString()} onChangeText={(v) => handleNumberChange(v, onChange)} />
                        <ErrorMessage message={error?.message} />
                    </Div>
                )}
            />
        </Field>

        <Field label="Reps" className="flex-1">
            <Controller
                name={getFieldName("reps", index, namePrefix)}
                control={control}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <Div>
                        <Input keyboardType="number-pad" value={value?.toString()} onChangeText={(v) => handleNumberChange(v, onChange)} />
                        <ErrorMessage message={error?.message} />
                    </Div>
                )}
            />
        </Field>
    </Row>
);

export const DurationField = ({ control, index, namePrefix }: BaseFieldProps) => (
    <Field label="Duration (mins)">
        <Controller
            name={getFieldName("duration", index, namePrefix)}
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
                <Div>
                    <Input keyboardType="decimal-pad" value={value?.toString()} onChangeText={(v) => handleNumberChange(v, onChange)} placeholder="30" />
                    <ErrorMessage message={error?.message} />
                </Div>
            )}
        />
    </Field>
);

export const CoreWeightToggleField = ({ control, index, namePrefix, onToggle }: BaseFieldProps & { onToggle?: (val: boolean) => void }) => (
    <Field label="Weighted Core">
        <Controller
            name={getFieldName("usesWeight", index, namePrefix)}
            control={control}
            render={({ field: { value, onChange } }) => {
                const isChecked = Boolean(value);

                return (
                    <Button
                        variant={isChecked ? "secondary" : "outline"}
                        className="h-auto p-0"
                        onPress={() => {
                            const next = !isChecked;
                            onChange(next);
                            onToggle?.(next);
                        }}
                        component>
                        <Row className="flex-1 gap-3 p-4">
                            <Div
                                className={cn(
                                    "border-border bg-background size-6 items-center justify-center rounded-md border",
                                    isChecked && "border-accent bg-accent",
                                )}>
                                {isChecked ? <Div className="bg-background size-2 rounded-full" /> : null}
                            </Div>
                            <Div className="flex-1 gap-1">
                                <P className={cn("font-semibold", isChecked ? "text-background" : "text-foreground")}>Track weight for this core movement</P>
                                <P className={cn("text-sm", isChecked ? "text-background/80" : "text-muted-foreground")}>
                                    Leave this off for bodyweight planks, crunches, and similar exercises.
                                </P>
                            </Div>
                        </Row>
                    </Button>
                );
            }}
        />
    </Field>
);

export const UnitAndValueField = ({
    control,
    index,
    namePrefix,
    isCardio,
    showWeight = true,
}: BaseFieldProps & { isCardio: boolean; showWeight?: boolean }) => {
    if (!isCardio && !showWeight) return null;

    return (
        <Field label={isCardio ? "Distance" : "Weight"}>
            <Row className="items-start gap-4">
                <Controller
                    name={getFieldName(isCardio ? "distance" : "weight", index, namePrefix)}
                    control={control}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <Div className="flex-1 gap-2">
                            <Input
                                keyboardType="decimal-pad"
                                value={value?.toString()}
                                onChangeText={(val) => handleNumberChange(val, onChange)}
                                placeholder={isCardio ? "5" : "10"}
                            />
                            <ErrorMessage message={error?.message} />
                        </Div>
                    )}
                />

                <Controller
                    name={getFieldName("unit", index, namePrefix)}
                    control={control}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <Div className="gap-2">
                            <Row>
                                {(isCardio ? DISTANCE_UNITS : WEIGHT_UNITS).map((unit) => (
                                    <Button
                                        key={unit}
                                        className="px-5"
                                        onPress={() => onChange(unit)}
                                        variant={value === unit ? "secondary" : "outline"}
                                        textClassName={value === unit ? "text-background" : "text-muted-foreground"}>
                                        {unit}
                                    </Button>
                                ))}
                            </Row>
                            <ErrorMessage message={error?.message} />
                        </Div>
                    )}
                />
            </Row>
        </Field>
    );
};

const handleNumberChange = (value: string, onChange: (val: number | string | undefined) => void) => {
    if (value === "" || value === ".") return onChange(undefined);
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) onChange(parsed);
    else onChange(value);
};
