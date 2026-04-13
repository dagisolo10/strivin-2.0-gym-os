import { cn } from "@/lib/utils";
import { Image } from "react-native";
import { useSync } from "@/hooks/use-sync";
import { useEffect, useState } from "react";
import { UserWithPlanOnly } from "@/types/types";
import { Div, H2, P, Row } from "@/components/ui/display";
import { formatDateLabel, getDateKey } from "@/lib/helper-functions";

export default function Header({ user }: { user: UserWithPlanOnly }) {
    const hour = new Date().getHours();
    const greeting = hour >= 18 ? "Evening" : hour >= 12 ? "Afternoon" : "Morning";
    const { isSyncing, lastSyncTime } = useSync({ enabled: true });

    const [dotCount, setDotCount] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => setDotCount((current) => (current === 3 ? 1 : current + 1)), 300);
        return () => clearInterval(interval);
    }, []);

    return (
        <Row className="items-end">
            <Div className="items-start gap-2">
                <Row className="gap-3">
                    <Image className="border-border size-14 rounded-full border" source={user.profile && user.profile.trim() ? { uri: user.profile } : require("../../../assets/images/images.png")} />
                    <Div>
                        <H2 className="m-0">{user.name}</H2>
                        <P className="text-muted-foreground text-sm">Good {greeting}</P>
                    </Div>
                </Row>
            </Div>

            <Div className="items-end">
                <P className="text-xl">{formatDateLabel(getDateKey())}</P>
                {isSyncing ? (
                    <Div className="row gap-1">
                        <P>Syncing</P>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Div key={index} className={cn("mt-1 size-1 rounded-full", dotCount > index ? "bg-primary" : "bg-primary/10")} />
                        ))}
                    </Div>
                ) : (
                    <P>Last synced: {lastSyncTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? "Never"}</P>
                )}
            </Div>
        </Row>
    );
}
