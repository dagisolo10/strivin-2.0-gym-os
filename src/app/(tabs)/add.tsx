import { z } from "zod";
import { cn } from "@/lib/utils";
import * as schema from "@/db/sqlite";
import { useRouter } from "expo-router";
import { exerciseSchema } from "@/db/zod";
import { toast } from "react-native-sonner";
import { weekdays } from "@/constants/data";
import { Exercise } from "@/types/interface";
import { useSQLiteContext } from "expo-sqlite";
import { addExercise } from "@/server/exercise";
import { ActivityIndicator } from "react-native";
import { AlertCircle } from "lucide-react-native";
import React, { useEffect, useMemo } from "react";
import { toOptionalNumber } from "@/lib/functions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/ui/button";
import { ScrollView } from "react-native-gesture-handler";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useForm, Controller, FieldErrors, FieldValues } from "react-hook-form";
import { Div, H1, P, Label, Badge, H2, Screen, Card, Row } from "@/components/ui/view";

export default function AddExerciseScreen() {
    const router = useRouter();

    const db = useSQLiteContext();
    const drizzleDB = useMemo(() => drizzle(db, { schema }), [db]);

    const { data: user } = useLiveQuery(drizzleDB.query.users.findFirst({ with: { plans: { with: { days: { with: { exercises: true } } } } } }));

    const { control, handleSubmit, watch, resetField, setValue, getValues } = useForm({
        resolver: zodResolver(exerciseSchema),
        defaultValues: {
            name: "",
            unit: "",
            type: "",
            variant: "",
            workoutDays: [],
        },
    });

    const selectedType = watch("type");
    const selectedUnit = watch("unit");
    const isCardio = selectedType === "Cardio";

    useEffect(() => {
        if (!selectedType) return;

        if (isCardio) {
            resetField("sets");
            resetField("reps");
            resetField("weight");
            if (!["km", "mi"].includes(String(getValues("unit") ?? ""))) setValue("unit", "km");
        } else {
            resetField("duration");
            resetField("distance");
            if (!["kg", "lb"].includes(String(getValues("unit") ?? ""))) setValue("unit", "kg");
        }
    }, [getValues, isCardio, resetField, selectedType, setValue]);

    const plans = user?.plans;

    if (!user) {
        return (
            <Screen className="items-center justify-center" scrollable={false}>
                <ActivityIndicator size="large" />
            </Screen>
        );
    }

    if (!plans || plans.length === 0) {
        return (
            <Screen className="items-center justify-center px-6" scrollable={false}>
                <P className="text-muted-foreground text-center">Create a workout plan before adding exercises.</P>
            </Screen>
        );
    }

    const planId = plans[0].id;

    const onInvalid = (errors: FieldErrors<FieldValues>) => {
        const errorEntries = Object.entries(errors).filter(([_, error]) => error?.message);
        toast.custom(<ErrorToast errorEntries={errorEntries} />, { duration: 20000 });
    };

    async function registerEx(data: z.infer<typeof exerciseSchema>) {
        const { workoutDays, ...exercises } = data;

        const payload = {
            planId,
            exercise: exercises as Exercise,
            workoutDays: workoutDays as Weekday[],
        };

        try {
            const request = addExercise(payload, drizzleDB).then((result) => {
                if (!result.success) throw new Error(String(result.error));
                return result;
            });

            toast.promise(request, {
                loading: "Adding Exercise...",
                success: "Success",
                error: "Failed to add exercise",
            });

            await request;

            router.replace("/(tabs)/home");
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <Screen className="px-6 pt-8 pb-32">
            <H1 className="text-foreground mb-2 text-3xl font-bold">New Exercise</H1>
            <P className="text-muted-foreground mb-8">Define the technical details of this movement.</P>

            <Div className="gap-6 pb-20">
                <ExerciseNameField control={control} />
                <Type control={control} />
                <Variant control={control} />
                <DayAssignment control={control} />

                <Card className="bg-accent gap-2 rounded-3xl border-0">
                    <Row className="items-center justify-between">
                        <H2 className="text-background text-lg font-bold">Metrics</H2>
                        <Badge variant="primary">{isCardio ? "Endurance" : "Strength"}</Badge>
                    </Row>

                    <Duration control={control} isCardio={isCardio} />
                    <SetsAndReps control={control} isCardio={isCardio} />
                    <UnitField control={control} isCardio={isCardio} unit={selectedUnit} />
                </Card>

                <Button onPress={handleSubmit(registerEx, onInvalid)} className="shadow-primary/30 mt-4 h-16 rounded-2xl shadow-lg">
                    <P className="text-lg font-bold text-white">Add to Routine</P>
                </Button>
            </Div>
        </Screen>
    );
}

function ErrorToast({ errorEntries }: { errorEntries: [string, any][] }) {
    return (
        <Div className="dark w-[95%] self-center">
            <Div className="row mb-2 gap-3">
                <Div className="bg-destructive/40 rounded-full p-2">
                    <AlertCircle size={20} color={"red"} />
                </Div>
                <P className="text-lg font-bold">Please check your inputs</P>
            </Div>

            <Div className="ml-2 gap-2">
                {errorEntries.map(([field, error]) => (
                    <Div key={field} className="row gap-2">
                        <Div className="bg-destructive/70 size-1.5 rounded-full" />
                        <P className="text-muted-foreground text-sm capitalize">
                            <P className="font-semibold">{field}:</P> {error?.message?.toString()}
                        </P>
                    </Div>
                ))}
            </Div>
        </Div>
    );
}

const ExerciseNameField = ({ control }: { control: any }) => (
    <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Div>
                <Label>Exercise Name</Label>
                <Input className={cn(error && "border-destructive border")} placeholder="e.g. Incline Bench Press" value={value} onChangeText={onChange} />
            </Div>
        )}
    />
);

const Type = ({ control }: { control: any }) => (
    <Div>
        <Label>Movement Type</Label>
        <Controller
            name="type"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Div className="row gap-2">
                        {["Push", "Pull", "Legs", "Cardio", "Core"].map((type) => {
                            const isSelected = value === type;
                            return (
                                <Button key={type} onPress={() => onChange(type)} variant={isSelected ? "primary" : "outline"} className={cn("flex-1", error && !isSelected && "border-destructive border")} textClassName={cn(isSelected ? "text-white" : "text-muted-foreground")}>
                                    {type}
                                </Button>
                            );
                        })}
                    </Div>
                </ScrollView>
            )}
        />
    </Div>
);

const Variant = ({ control }: { control: any }) => (
    <Div className="flex-1">
        <Label>Variant</Label>
        <Controller
            name="variant"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
                <Div className="row flex-wrap justify-evenly gap-2">
                    {["Upper", "Lower", "Endurance"].map((type) => (
                        <Button className={cn(error && "border-destructive border", "flex-1 px-0")} key={type} variant={value === type ? "primary" : "outline"} textClassName={cn(value === type ? "text-white" : "text-muted-foreground")} onPress={() => onChange(type)}>
                            {type}
                        </Button>
                    ))}
                </Div>
            )}
        />
    </Div>
);

const DayAssignment = ({ control }: { control: any }) => (
    <Div className="flex-1">
        <Label>Perform on:</Label>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Row className="gap-2">
                <Controller
                    name="workoutDays"
                    control={control}
                    defaultValue={[]}
                    render={({ field: { value = [], onChange }, fieldState: { error } }) => (
                        <Div className="flex-1">
                            <Div className="row gap-2">
                                {weekdays.map((day) => {
                                    const isSelected = value.includes(day);
                                    return (
                                        <Button
                                            key={day}
                                            variant={isSelected ? "primary" : "outline"}
                                            className={cn(error && "border-destructive border", "flex-1")}
                                            textClassName={isSelected ? "text-background" : "text-muted-foreground"}
                                            onPress={() => {
                                                const next = isSelected ? value.filter((d: string) => d !== day) : [...value, day];
                                                onChange(next);
                                            }}>
                                            {day}
                                        </Button>
                                    );
                                })}
                            </Div>
                        </Div>
                    )}
                />
            </Row>
        </ScrollView>
    </Div>
);

function Duration({ control, isCardio }: { control: any; isCardio: boolean }) {
    if (isCardio)
        return (
            <Div className="flex-1">
                <Controller
                    control={control}
                    name="duration"
                    render={({ field, fieldState: { error } }) => (
                        <Div className="flex-1">
                            <Label className="text-background">Duration (min)</Label>
                            <Input className={cn(error && "border-destructive border")} keyboardType="numeric" onChangeText={(t) => field.onChange(toOptionalNumber(t))} />
                        </Div>
                    )}
                />
            </Div>
        );
}

function SetsAndReps({ control, isCardio }: { control: any; isCardio: boolean }) {
    if (!isCardio)
        return (
            <Div className="flex-1">
                <Div className="row flex-1 gap-4">
                    <Controller
                        control={control}
                        name="sets"
                        render={({ field, fieldState: { error } }) => (
                            <Div className="flex-1">
                                <Label className="text-background">Sets</Label>
                                <Input className={cn(error && "border-destructive border")} keyboardType="numeric" onChangeText={(t) => field.onChange(toOptionalNumber(t))} />
                            </Div>
                        )}
                    />
                    <Controller
                        control={control}
                        name="reps"
                        render={({ field, fieldState: { error } }) => (
                            <Div className="flex-1">
                                <Label className="text-background">Reps</Label>
                                <Input className={cn(error && "border-destructive border")} keyboardType="numeric" onChangeText={(t) => field.onChange(toOptionalNumber(t))} />
                            </Div>
                        )}
                    />
                </Div>
            </Div>
        );
}

const UnitField = ({ control, isCardio, unit }: { control: any; isCardio: boolean; unit: string }) => (
    <Div className="flex-1 flex-row items-end gap-2">
        <Controller
            control={control}
            name={isCardio ? "distance" : "weight"}
            render={({ field, fieldState: { error } }) => (
                <Div className="flex-1">
                    <Label className="text-background">
                        {isCardio ? "Distance" : "Weight"} ({unit || (isCardio ? "km" : "kg")})
                    </Label>
                    <Input className={cn(error && "border-destructive border")} keyboardType="numeric" onChangeText={(t) => field.onChange(toOptionalNumber(t))} />
                </Div>
            )}
        />
        <Controller
            control={control}
            name="unit"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
                <Div className="row gap-2">
                    {(isCardio ? ["km", "mi"] : ["kg", "lb"]).map((unit) => (
                        <Button variant={value === unit ? "primary" : "outline"} textClassName="text-background" onPress={() => onChange(unit)} className={cn(error && "border-destructive border", "w-22")} key={unit}>
                            {unit}
                        </Button>
                    ))}
                </Div>
            )}
        />
    </Div>
);
