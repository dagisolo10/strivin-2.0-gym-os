import { Button, Input } from "../ui/button";
import { Badge, Card, Div, Label, P, Row } from "../ui/view";

import { Ionicons } from "@expo/vector-icons";
import { Controller, useFormContext } from "react-hook-form";

export default function Name() {
    const { control } = useFormContext();

    return (
        <Div className="gap-5">
            <Card className="bg-muted/50 gap-2 rounded-4xl border-0 p-5">
                <Row>
                    <Badge variant="outline">Profile</Badge>
                    <Div className="bg-primary/10 size-11 items-center justify-center rounded-2xl">
                        <Ionicons name="person-outline" size={20} color="#527bda" />
                    </Div>
                </Row>

                <Controller
                    name="name"
                    control={control}
                    render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
                        <Div className="gap-2">
                            <Label>What should we call you?</Label>
                            <Div className="relative">
                                <Input value={value} onBlur={onBlur} onChangeText={onChange} placeholder="Enter your name" className="rounded-2xl pr-12 text-base" />
                                {value?.length ? (
                                    <Button onPress={() => onChange("")} variant="ghost" size="icon" className="absolute top-1 right-2 size-10 rounded-full">
                                        <Ionicons name="close-circle" size={22} color="#666666" />
                                    </Button>
                                ) : null}
                            </Div>
                            {error ? <P className="text-destructive text-sm">{error.message}</P> : null}
                        </Div>
                    )}
                />
            </Card>

            <Card className="gap-2 rounded-4xl p-5">
                <P className="text-sm">This name shows up in your dashboard header, weekly summaries, and local workout history.</P>
                <P className="text-muted-foreground text-sm">Keep it simple so the app feels personal from the first session.</P>
            </Card>
        </Div>
    );
}
