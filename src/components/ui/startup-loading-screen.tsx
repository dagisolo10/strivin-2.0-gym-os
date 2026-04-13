import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Badge, Div, H1, H2, P, Row, Screen } from "@/components/ui/display";

export default function StartupLoadingScreen() {
    const [dotCount, setDotCount] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => setDotCount((current) => (current === 3 ? 1 : current + 1)), 750);

        return () => clearInterval(interval);
    }, []);

    return (
        <Screen nonScrollable className="bg-background items-center justify-center">
            <Div className="items-center justify-center gap-6">
                <Div className="border-primary/20 bg-primary/5 h-40 w-40 items-center justify-center rounded-full border-4">
                    <Div className="bg-primary/10 h-24 w-24 items-center justify-center rounded-full">
                        <H1 className="text-primary text-5xl font-extrabold">S</H1>
                    </Div>
                </Div>

                <Div className="items-center justify-center gap-3">
                    <H2 className="text-center">Starting Strivin</H2>
                    <P className="text-muted-foreground text-center">Preparing your routine and syncing your profile.</P>
                </Div>

                <Row className="items-center justify-center gap-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Div key={index} className={cn("size-3 rounded-full", dotCount > index ? "bg-primary" : "bg-muted")} />
                    ))}
                </Row>

                <Badge variant="outline" className="px-4 py-2">
                    {"Booting up" + ".".repeat(dotCount)}
                </Badge>

                <ActivityIndicator size="large" color="#2563EB" />
            </Div>
        </Screen>
    );
}
