import { cn } from "@/lib/utils";
import { useRouter } from "expo-router";
import { onboardingSchema } from "@/db/zod";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/server/onboard";
import { Div, H1, P } from "@/components/ui/view";
import Goals from "@/components/onboarding/goals";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Name from "@/components/onboarding/name-input";
import Finish from "@/components/onboarding/finish-up";
import Identity from "@/components/onboarding/profile";
import { FormProvider, useForm } from "react-hook-form";
import Exercises from "@/components/onboarding/exercises";
import Frequency from "@/components/onboarding/frequency";
import { STEP_CONTENT, TOTAL_STEPS } from "@/constants/data";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import FloatingRocket from "@/components/onboarding/floating-rocket";
import { ScrollView, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeInRight, FadeInUp, FadeOutLeft, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const translateY = useSharedValue(0);

    const { profile, updateField, ...values } = useOnboardingStore();
    const methods = useForm({ resolver: zodResolver(onboardingSchema), defaultValues: { ...values } });

    const bobbingStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

    const display = STEP_CONTENT[step as keyof typeof STEP_CONTENT];

    const prevStep = () => setStep((step) => Math.max(step - 1, -1));
    const nextStep = async () => {
        const fieldsByStep: Record<number, any> = { 1: ["name"], 2: ["workoutDays", "split"], 3: ["exercises"], 4: ["goal"], 5: ["profile"] };
        const fieldsToValidate = fieldsByStep[step];

        if (fieldsToValidate && !(await methods.trigger(fieldsToValidate))) return;

        const currentValues = methods.getValues();

        if (step === TOTAL_STEPS) {
            console.log("Saving to SQLite:", { ...values, profile });
            await registerUser({ ...values, profile });
            router.replace("/(tabs)/profile");
        } else {
            (Object.keys(currentValues) as (keyof typeof currentValues)[]).forEach((key) => updateField(key, currentValues[key] as any));
            setStep((s) => Math.min(s + 1, TOTAL_STEPS));
        }
    };

    useEffect(() => {
        translateY.value = withRepeat(withSequence(withTiming(-15, { duration: 800 }), withTiming(0, { duration: 800 })), -1, true);
    }, [translateY]);

    return (
        <Div className="bg-dead-zone dark flex-1">
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 px-4 pt-12">
                    <Div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                        <Animated.View layout={FadeInUp} className={cn(step === TOTAL_STEPS ? "bg-success" : "bg-primary", "h-full")} style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
                    </Div>

                    <FormProvider {...methods}>
                        <GestureHandlerRootView>
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                                <Animated.View key={`header-${step}`} entering={FadeInUp.delay(100)} className="mb-10 items-center gap-3">
                                    <H1 className="text-center text-4xl tracking-tight">{display.title}</H1>
                                    <P className="text-muted-foreground text-center text-lg leading-6">{display.subtitle}</P>
                                </Animated.View>

                                <Div className="flex-1 pb-6">
                                    <Animated.View key={`step-${step}`} entering={FadeInRight.duration(400)} exiting={FadeOutLeft.duration(400)}>
                                        {step === 0 && <FloatingRocket style={bobbingStyle} />}
                                        {step === 1 && <Name />}
                                        {step === 2 && <Frequency />}
                                        {step === 3 && <Exercises />}
                                        {step === 4 && <Goals />}
                                        {step === 5 && <Identity />}
                                        {step === 6 && <Finish />}
                                    </Animated.View>
                                </Div>
                            </ScrollView>
                        </GestureHandlerRootView>
                    </FormProvider>

                    <Div className="flex-row items-center gap-4 border-t border-zinc-800 py-6">
                        {step > 0 && step < TOTAL_STEPS && (
                            <Button onPress={prevStep} variant="outline" className="flex-1 py-4">
                                <P className="font-semibold text-zinc-400">Back</P>
                            </Button>
                        )}
                        <Button variant={step === TOTAL_STEPS ? "success" : "primary"} onPress={nextStep} className={cn("flex-2 py-4")}>
                            <P className="font-bold text-white">{step === 0 ? "Get Started" : step === TOTAL_STEPS ? "Go to Dashboard" : "Continue"}</P>
                        </Button>
                    </Div>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Div>
    );
}
