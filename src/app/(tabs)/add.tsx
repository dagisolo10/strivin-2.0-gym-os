import { z } from "zod";
import { cn } from "@/lib/utils";
import { useRouter } from "expo-router";
import { exerciseSchema } from "@/db/zod";
import { useUser } from "@/hooks/use-user";
import { toast } from "react-native-sonner";
import { weekdays } from "@/constants/data";
import { addExercise } from "@/server/exercise";
import { ActivityIndicator } from "react-native";
import { AlertCircle } from "lucide-react-native";
import React, { useEffect, useMemo } from "react";
import { usePlanStore } from "@/store/use-plan-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/ui/button";
import { ScrollView } from "react-native-gesture-handler";
import { toOptionalNumber } from "@/lib/helper-functions";
import { PlanCarousel } from "@/components/plans/plan-carousel";
import { Badge, Card, Div, H1, H2, P, Row, Screen } from "@/components/ui/view";
import { useForm, Controller, FieldErrors, FieldValues } from "react-hook-form";

type AddExerciseValues = z.infer<typeof exerciseSchema>;

export default function AddExerciseScreen() {
    const router = useRouter();
    const { user, isLoading } = useUser();
    const selectedPlanId = usePlanStore((state) => state.selectedPlanId);
    const setSelectedPlanId = usePlanStore((state) => state.setSelectedPlanId);
    const syncSelectedPlan = usePlanStore((state) => state.syncSelectedPlan);

    const plans = useMemo(() => user?.plans ?? [], [user?.plans]);
    const planIds = useMemo(() => plans.map((plan) => plan.id).join("|"), [plans]);

    const { control, handleSubmit, watch, resetField, setValue, getValues } = useForm<AddExerciseValues>({
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
    const selectedDays = watch("workoutDays") ?? [];
    const selectedVariant = watch("variant");
    const exerciseName = watch("name");
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

    useEffect(() => {
        syncSelectedPlan(plans.map((plan) => plan.id));
    }, [planIds, plans, syncSelectedPlan]);

    if (isLoading) {
        return (
            <Screen className="items-center justify-center">
                <ActivityIndicator size="large" />
            </Screen>
        );
    }

    if (!user) {
        return (
            <Screen className="items-center justify-center px-6">
                <P className="text-muted-foreground text-center">User not found.</P>
            </Screen>
        );
    }

    const plan = plans.find((item) => item.id === selectedPlanId) ?? plans[0];
    if (!plan) {
        return (
            <Screen className="items-center justify-center px-6">
                <P className="text-muted-foreground text-center">Create a workout plan before adding exercises.</P>
            </Screen>
        );
    }

    const onInvalid = (errors: FieldErrors<FieldValues>) => {
        const errorEntries = Object.entries(errors).filter(([_, error]) => error?.message);
        toast.custom(<ErrorToast errorEntries={errorEntries} />, { duration: 20000 });
    };

    async function registerEx(data: AddExerciseValues) {
        const { workoutDays, ...exercises } = data;

        const payload = {
            userId: user?.id ?? 0,
            planId: plan.id,
            exercise: exercises as any,
            workoutDays: workoutDays as Weekday[],
        };

        try {
            const request = addExercise(payload).then((result) => {
                if (!result.success) throw new Error(String(result.error));
                return result;
            });

            toast.promise(request, {
                loading: "Adding Exercise...",
                success: "Exercise added",
                error: "Failed to add exercise",
            });

            await request;
            router.replace("/(tabs)/home");
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Screen className="px-6 py-8">
            <Div className="gap-6 pb-16">
                <Card className="bg-accent gap-4 rounded-4xl border-0 px-6 py-6">
                    <Row className="items-start gap-4">
                        <Div className="flex-1 gap-4">
                            <Badge variant="glass">Exercise Studio</Badge>
                            <Div className="gap-2">
                                <H1 className="text-3xl text-white">Build a polished training block</H1>
                                <P className="max-w-[320px] text-white/85">Create a movement, shape its workload, and slot it into your weekly plan with a cleaner, coach-like structure.</P>
                            </Div>
                        </Div>
                        <Div className="rounded-[28px] bg-white/12 px-4 py-4">
                            <P className="text-xs tracking-[2px] text-white/70 uppercase">Assigned</P>
                            <P className="mt-1 text-2xl text-white">{selectedDays.length}</P>
                            <P className="text-sm text-white/75">days ready</P>
                        </Div>
                    </Row>
                    <Row className="gap-3">
                        <HeroPill label="Plan" value={plan.split} />
                        <HeroPill label="Days" value={`${plan.workoutDaysPerWeek}/week`} />
                    </Row>
                </Card>

                <PlanCarousel plans={plans} selectedPlanId={plan.id} onSelect={setSelectedPlanId} title="Destination Plan" subtitle="Pick the plan that should receive this movement before you save it." />

                <Card className="bg-background gap-5 rounded-[28px] border-0 px-5 py-5">
                    <Row className="items-start gap-3">
                        <Div className="flex-1">
                            <SectionTitle eyebrow="Identity" title="Describe the movement" note="Start with the name, category, and placement so the routine stays easy to scan later." />
                        </Div>
                        <StatusChip label="Type" value={selectedType || "Choose"} muted={!selectedType} />
                    </Row>
                    <ExerciseNameField control={control} />
                    <Type control={control} />
                    <Variant control={control} />
                    <DayAssignment control={control} />
                </Card>

                <Card className="bg-muted/50 gap-5 rounded-[28px] border-0 px-5 py-5">
                    <Row>
                        <SectionTitle eyebrow="Metrics" title="Define the training target" note={isCardio ? "Use time and distance for conditioning work." : "Use sets, reps, and weight for strength work."} />
                        <Badge variant={isCardio ? "secondary" : "outline"}>{isCardio ? "Endurance" : "Strength"}</Badge>
                    </Row>

                    {isCardio ? <Duration control={control} /> : <SetsAndReps control={control} />}
                    <UnitField control={control} isCardio={isCardio} unit={selectedUnit} />
                </Card>

                <Card className="bg-background gap-4 rounded-[28px] border-0 px-5 py-5">
                    <SectionTitle eyebrow="Preview" title="Routine snapshot" note="A quick read on how this movement will present once it lands in the plan." />
                    <Div className="bg-muted/40 gap-3 rounded-3xl px-4 py-4">
                        <Row className="items-start">
                            <Div className="flex-1 gap-1">
                                <P className="text-base">{exerciseName?.trim() || "Unnamed movement"}</P>
                                <P className="text-muted-foreground text-sm">
                                    {selectedType || "Type pending"} {selectedVariant ? `• ${selectedVariant}` : ""}
                                </P>
                            </Div>
                            <Badge variant={isCardio ? "secondary" : "outline"}>{selectedUnit || (isCardio ? "km" : "kg")}</Badge>
                        </Row>

                        <Div className="row flex-wrap gap-2">
                            {selectedDays.length ? (
                                selectedDays.map((day) => (
                                    <Badge key={day} variant="muted">
                                        {day}
                                    </Badge>
                                ))
                            ) : (
                                <Badge variant="outline">Assign workout days</Badge>
                            )}
                        </Div>

                        <P className="text-muted-foreground text-sm">{isCardio ? "This will track distance and duration in the day logger." : "This will show target sets, reps, and weight guidance in the day logger."}</P>
                    </Div>
                </Card>

                <Card className="gap-3 rounded-[28px] border-0 bg-[#FFF1D6] px-5 py-5">
                    <Badge variant="outline">Coach note</Badge>
                    <P className="text-sm">Use specific names like &quote;Incline Dumbbell Press&quote; or &quote;Treadmill Tempo Run&quote; so logging later feels immediate and precise.</P>
                </Card>

                <Button onPress={handleSubmit(registerEx, onInvalid)} className="h-16 rounded-2xl">
                    Add To Routine
                </Button>
            </Div>
        </Screen>
    );
}

function HeroPill({ label, value }: { label: string; value: string }) {
    return (
        <Div className="flex-1 rounded-3xl bg-white/12 px-4 py-4">
            <P className="text-xs text-white/80 uppercase">{label}</P>
            <P className="mt-1 text-sm text-white">{value}</P>
        </Div>
    );
}

function StatusChip({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
    return (
        <Div className={cn("min-w-24 rounded-[22px] px-4 py-3", muted ? "bg-muted" : "bg-primary/10")}>
            <P className="text-muted-foreground text-xs uppercase">{label}</P>
            <P className={cn("mt-1 text-sm", muted ? "text-muted-foreground" : "text-primary")}>{value}</P>
        </Div>
    );
}

function SectionTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
    return (
        <Div className="gap-1">
            <Badge variant="outline">{eyebrow}</Badge>
            <H2 className="text-2xl">{title}</H2>
            <P className="text-muted-foreground text-sm">{note}</P>
        </Div>
    );
}

function ErrorToast({ errorEntries }: { errorEntries: [string, any][] }) {
    return (
        <Div className="bg-background w-[95%] self-center rounded-3xl px-5 py-5">
            <Row className="mb-3 gap-3">
                <Div className="bg-destructive/10 rounded-full p-2">
                    <AlertCircle size={20} color="red" />
                </Div>
                <P>Please check your inputs</P>
            </Row>

            <Div className="gap-2">
                {errorEntries.map(([field, error]) => (
                    <Row key={field} className="items-start gap-2">
                        <Div className="bg-destructive mt-2 size-1.5 rounded-full" />
                        <P className="text-muted-foreground flex-1 text-sm">
                            <P className="text-foreground">{field}:</P> {error?.message?.toString()}
                        </P>
                    </Row>
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
            <Div className="gap-2">
                <P className="text-sm">Exercise Name</P>
                <Input className={cn("h-14 rounded-2xl text-base", error && "border-destructive")} placeholder="e.g. Incline Bench Press" value={value} onChangeText={onChange} />
            </Div>
        )}
    />
);

const Type = ({ control }: { control: any }) => (
    <Controller
        name="type"
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
            <Div className="gap-2">
                <P className="text-sm">Movement Type</P>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Div className="row gap-2">
                        {["Push", "Pull", "Legs", "Cardio", "Core"].map((type) => {
                            const isSelected = value === type;
                            return (
                                <Button
                                    key={type}
                                    onPress={() => onChange(type)}
                                    variant={isSelected ? "secondary" : "outline"}
                                    className={cn("rounded-2xl px-5", error && !isSelected && "border-destructive")}
                                    textClassName={isSelected ? "text-foreground" : "text-muted-foreground"}>
                                    {type}
                                </Button>
                            );
                        })}
                    </Div>
                </ScrollView>
            </Div>
        )}
    />
);

const Variant = ({ control }: { control: any }) => (
    <Controller
        name="variant"
        control={control}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
            <Div className="gap-2">
                <P className="text-sm">Variant</P>
                <Div className="row flex-wrap gap-2">
                    {["Upper", "Lower", "Endurance"].map((type) => (
                        <Button
                            className={cn(error && "border-destructive", "rounded-2xl px-5")}
                            key={type}
                            variant={value === type ? "secondary" : "outline"}
                            textClassName={value === type ? "text-foreground" : "text-muted-foreground"}
                            onPress={() => onChange(type)}>
                            {type}
                        </Button>
                    ))}
                </Div>
            </Div>
        )}
    />
);

const DayAssignment = ({ control }: { control: any }) => (
    <Controller
        name="workoutDays"
        control={control}
        defaultValue={[]}
        render={({ field: { value = [], onChange }, fieldState: { error } }) => (
            <Div className="gap-2">
                <P className="text-sm">Assign Days</P>
                <Div className="row flex-wrap gap-2">
                    {weekdays.map((day) => {
                        const isSelected = value.includes(day);
                        return (
                            <Button
                                key={day}
                                variant={isSelected ? "secondary" : "outline"}
                                className={cn(error && "border-destructive", "rounded-2xl px-4")}
                                textClassName={isSelected ? "text-foreground" : "text-muted-foreground"}
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
);

function Duration({ control }: { control: any }) {
    return (
        <Controller
            control={control}
            name="duration"
            render={({ field, fieldState: { error } }) => (
                <Div className="gap-2">
                    <P className="text-sm">Duration (min)</P>
                    <Input className={cn("h-14 rounded-2xl text-base", error && "border-destructive")} keyboardType="numeric" onChangeText={(t) => field.onChange(toOptionalNumber(t))} />
                </Div>
            )}
        />
    );
}

function SetsAndReps({ control }: { control: any }) {
    return (
        <Row className="gap-3">
            <Controller
                control={control}
                name="sets"
                render={({ field, fieldState: { error } }) => (
                    <Div className="flex-1 gap-2">
                        <P className="text-sm">Sets</P>
                        <Input className={cn("h-14 rounded-2xl text-base", error && "border-destructive")} keyboardType="numeric" onChangeText={(t) => field.onChange(toOptionalNumber(t))} />
                    </Div>
                )}
            />
            <Controller
                control={control}
                name="reps"
                render={({ field, fieldState: { error } }) => (
                    <Div className="flex-1 gap-2">
                        <P className="text-sm">Reps</P>
                        <Input className={cn("h-14 rounded-2xl text-base", error && "border-destructive")} keyboardType="numeric" onChangeText={(t) => field.onChange(toOptionalNumber(t))} />
                    </Div>
                )}
            />
        </Row>
    );
}

const UnitField = ({ control, isCardio, unit }: { control: any; isCardio: boolean; unit: string }) => (
    <Div className="gap-3">
        <Controller
            control={control}
            name={isCardio ? "distance" : "weight"}
            render={({ field, fieldState: { error } }) => (
                <Div className="gap-2">
                    <P className="text-sm">
                        {isCardio ? "Distance" : "Weight"} ({unit || (isCardio ? "km" : "kg")})
                    </P>
                    <Input className={cn("h-14 rounded-2xl text-base", error && "border-destructive")} keyboardType="numeric" onChangeText={(t) => field.onChange(toOptionalNumber(t))} />
                </Div>
            )}
        />
        <Controller
            control={control}
            name="unit"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
                <Div className="row gap-2">
                    {(isCardio ? ["km", "mi"] : ["kg", "lb"]).map((nextUnit) => (
                        <Button
                            variant={value === nextUnit ? "secondary" : "outline"}
                            onPress={() => onChange(nextUnit)}
                            className={cn(error && "border-destructive", "rounded-2xl px-5")}
                            key={nextUnit}
                            textClassName={value === nextUnit ? "text-foreground" : "text-muted-foreground"}>
                            {nextUnit}
                        </Button>
                    ))}
                </Div>
            )}
        />
    </Div>
);
