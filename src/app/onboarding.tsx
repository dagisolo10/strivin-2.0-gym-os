import { z } from "zod";
import { cn } from "@/lib/utils";
import { useRouter } from "expo-router";
import { onboardingSchema } from "@/db/zod";
import { registerUser } from "@/server/onboard";
import Goals from "@/components/onboarding/goals";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/interactive";
import { zodResolver } from "@hookform/resolvers/zod";
import Name from "@/components/onboarding/name-input";
import Profile from "@/components/onboarding/profile";
import Finish from "@/components/onboarding/finish-up";
import { FormProvider, useForm } from "react-hook-form";
import Exercises from "@/components/onboarding/exercises";
import Frequency from "@/components/onboarding/frequency";
import { STEP_CONTENT, TOTAL_STEPS } from "@/constants/data";
import Intro from "@/components/onboarding/floating-barbell";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Badge, Card, Div, H1, P, Row } from "@/components/ui/display";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Animated, { FadeInRight, FadeInUp, FadeOutLeft, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

type OnboardingFormValues = z.input<typeof onboardingSchema>;

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const translateY = useSharedValue(0);

    const updateField = useOnboardingStore((state) => state.updateField);
    const resetOnboarding = useOnboardingStore((state) => state.reset);

    const storedName = useOnboardingStore((state) => state.name);
    const storedSplit = useOnboardingStore((state) => state.split);
    const storedWorkoutDays = useOnboardingStore((state) => state.workoutDays);
    const storedExercises = useOnboardingStore((state) => state.exercises);
    const storedGoal = useOnboardingStore((state) => state.goal);
    const storedSessionLength = useOnboardingStore((state) => state.sessionLength);
    const storedFitnessLevel = useOnboardingStore((state) => state.fitnessLevel);
    const storedProfile = useOnboardingStore((state) => state.profile);

    const methods = useForm<OnboardingFormValues>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            name: storedName,
            split: storedSplit,
            workoutDays: storedWorkoutDays,
            exercises: storedExercises.map((exercise) => {
                const isCardio = exercise.type === "Cardio";
                const isCore = exercise.type === "Core";
                return {
                    ...exercise,
                    unit: exercise.unit ?? undefined,
                    usesWeight: (exercise as any).usesWeight ?? (isCardio || isCore ? false : true),
                    sets: exercise.sets ?? undefined,
                    reps: exercise.reps ?? undefined,
                    weight: exercise.weight ?? undefined,
                    distance: exercise.distance ?? undefined,
                    duration: exercise.duration ?? undefined,
                };
            }),
            goal: storedGoal,
            sessionLength: storedSessionLength,
            fitnessLevel: storedFitnessLevel,
            profile: storedProfile ?? "",
        },
    });

    const bobbingStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
    const display = STEP_CONTENT[step as keyof typeof STEP_CONTENT];

    const prevStep = () => setStep((currentStep) => Math.max(currentStep - 1, 0));

    const nextStep = async () => {
        const fieldsByStep: Partial<Record<number, (keyof OnboardingFormValues)[]>> = {
            1: ["name"],
            2: ["workoutDays", "split"],
            3: ["exercises"],
            4: ["goal", "sessionLength", "fitnessLevel"],
            5: ["profile"],
        };
        const fieldsToValidate = fieldsByStep[step];

        if (fieldsToValidate && !(await methods.trigger(fieldsToValidate))) return;

        const currentValues = methods.getValues();

        if (step === TOTAL_STEPS) {
            if (isSubmitting) return;
            try {
                setIsSubmitting(true);
                await registerUser({
                    name: currentValues.name,
                    split: currentValues.split as WorkoutSplit,
                    workoutDays: currentValues.workoutDays as Weekday[],
                    exercises: currentValues.exercises?.map((exercise) => ({
                        ...exercise,
                        workoutDays: exercise.workoutDays as Weekday[],
                        unit: (exercise.unit as Unit | undefined) ?? undefined,
                        type: exercise.type as ExerciseType,
                        variant: exercise.variant as ExerciseVariant,
                    })),
                    goal: currentValues.goal as Goal | null,
                    sessionLength: currentValues.sessionLength,
                    fitnessLevel: currentValues.fitnessLevel as FitnessLevel | null,
                    profile: currentValues.profile || null,
                });
                resetOnboarding();
                router.replace("/(tabs)/home");
            } catch (error) {
                console.error("Failed to save onboarding data:", error);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            (Object.keys(currentValues) as (keyof OnboardingFormValues)[]).forEach((key) => updateField(key, currentValues[key]));
            setStep((currentStep) => Math.min(currentStep + 1, TOTAL_STEPS));
        }
    };

    useEffect(() => {
        translateY.value = withRepeat(withSequence(withTiming(-15, { duration: 800 }), withTiming(0, { duration: 800 })), -1, true);
    }, [translateY]);

    return (
        <Div className="bg-dead-zone flex-1">
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="bg-background flex-1 p-6">
                    <Div className="gap-6">
                        <Row>
                            <Badge variant="muted">Setup</Badge>
                            <P className="text-muted-foreground text-sm">
                                Step {Math.min(step + 1, TOTAL_STEPS + 1)} of {TOTAL_STEPS + 1}
                            </P>
                        </Row>

                        <Div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                            <Animated.View
                                layout={FadeInUp}
                                className={cn(step === TOTAL_STEPS ? "bg-success" : "bg-primary", "h-full rounded-full")}
                                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                            />
                        </Div>
                    </Div>

                    <FormProvider {...methods}>
                        <GestureHandlerRootView>
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingTop: 24, paddingBottom: 24 }}>
                                <Card variant={"accent"} className="mb-6 gap-3">
                                    <Animated.View key={`header-${step}`} entering={FadeInUp.delay(100)} className="gap-3">
                                        <H1 className="text-4xl tracking-tight text-white">{display.title}</H1>
                                        <P className="text-base leading-6 text-white/85">{display.subtitle}</P>
                                    </Animated.View>
                                </Card>

                                <Div className="flex-1">
                                    <Animated.View key={`step-${step}`} entering={FadeInRight.duration(400)} exiting={FadeOutLeft.duration(400)}>
                                        {step === 0 && <Intro style={bobbingStyle} />}
                                        {step === 1 && <Name />}
                                        {step === 2 && <Frequency />}
                                        {step === 3 && <Exercises />}
                                        {step === 4 && <Goals />}
                                        {step === 5 && <Profile />}
                                        {step === 6 && <Finish />}
                                    </Animated.View>
                                </Div>
                            </ScrollView>
                        </GestureHandlerRootView>
                    </FormProvider>

                    <Div className="border-border flex-row items-center gap-4 border-t pt-5">
                        {step > 0 && step < TOTAL_STEPS ? (
                            <Button onPress={prevStep} variant="outline">
                                Back
                            </Button>
                        ) : null}
                        <Button variant={step === TOTAL_STEPS ? "success" : "primary"} onPress={nextStep} className={cn(step === 0 ? "w-full" : "flex-1")} disabled={isSubmitting}>
                            {step === 0 ? "Get Started" : step === TOTAL_STEPS ? (isSubmitting ? "Saving..." : "Go to Dashboard") : "Continue"}
                        </Button>
                    </Div>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Div>
    );
}
