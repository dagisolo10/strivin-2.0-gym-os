import { ErrorMessage } from "../ui/screen-ui";
import { Button, Input } from "../ui/interactive";
import { Badge, Card, Div, Field, P, Row } from "../ui/display";

import { Ionicons } from "@expo/vector-icons";
import { Controller, useFormContext } from "react-hook-form";

export default function Name() {
    const { control } = useFormContext();

    return (
        <Div className="gap-5">
            <Card variant="muted" className="gap-2">
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
                        <Field label="What should we call you?">
                            <Div className="relative">
                                <Input value={value} onBlur={onBlur} onChangeText={onChange} placeholder="Enter your name" className="rounded-2xl pr-12 text-base" />
                                {value?.length > 0 && (
                                    <Button onPress={() => onChange("")} variant="ghost" size="icon" className="absolute top-1/2 right-2 size-10 -translate-y-1/2 rounded-full">
                                        <Ionicons name="close-circle" size={22} color="#666666" />
                                    </Button>
                                )}
                            </Div>
                            <ErrorMessage message={error?.message} />
                        </Field>
                    )}
                />
            </Card>

            <Card variant="muted" className="gap-2">
                <P className="text-sm">This name shows up in your dashboard header, weekly summaries, and local workout history.</P>
                <P className="text-muted-foreground text-sm">Keep it simple so the app feels personal from the first session.</P>
            </Card>
        </Div>
    );
}
