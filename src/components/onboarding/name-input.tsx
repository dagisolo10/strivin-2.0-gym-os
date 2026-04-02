import { Button, Input } from "../ui/button";
import { Div, Row, P, Label } from "../ui/view";

import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useFormContext } from "react-hook-form";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function Name() {
    const { control } = useFormContext();

    return (
        <Animated.View entering={FadeInUp.delay(200)} className="w-full gap-4 px-2">
            <Controller
                name="name"
                control={control}
                render={({ field: { onChange, value, onBlur }, fieldState: { error, isTouched } }) => (
                    <Div>
                        <Label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Identity</Label>
                        <Div className={cn("relative w-full justify-center rounded-2xl border transition-all duration-200", isTouched ? "border-blue-500 bg-zinc-950/80" : "border-zinc-800")}>
                            <Input value={value} onBlur={onBlur} onChangeText={onChange} placeholder="Enter your name..." placeholderTextColor="#52525b" className="border-0 bg-transparent text-xl font-semibold text-white" />
                            {value.length > 0 && (
                                <Button onPress={() => onChange("")} variant="ghost" size={"icon"} className="absolute right-4 size-10 items-center justify-center rounded-full">
                                    <Ionicons name="close-circle" size={24} color="#3f3f46" />
                                </Button>
                            )}
                        </Div>
                        {error && <Label className="text-destructive">{error.message}</Label>}
                    </Div>
                )}
            />

            <Row className="items-center gap-3 px-2">
                <Div className="bg-primary/30 size-10 items-center justify-center rounded-2xl">
                    <Ionicons name="person-outline" size={20} color="#3b82f6" />
                </Div>
                <P className="flex-1 text-sm text-zinc-500">This is how we&apos;ll address you in your daily summaries and workout logs.</P>
            </Row>
        </Animated.View>
    );
}
