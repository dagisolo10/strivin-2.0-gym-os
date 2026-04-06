import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react-native";
import { Div, Row, P, Badge, H2 } from "@/components/ui/display";

export function ErrorToast({ errorEntries }: { errorEntries: [string, any][] }) {
    return (
        <Div className="bg-background w-[95%] self-center rounded-3xl p-5">
            <Row className="mb-3 gap-3">
                <Div className="bg-destructive/10 rounded-full p-2">
                    <AlertCircle size={20} color="red" />
                </Div>
                <P>Please check your inputs</P>
            </Row>

            <Div>
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

export function HeroPill({ label, value }: { label: string; value: string }) {
    return (
        <Div className="flex-1 gap-1 rounded-3xl border border-white/20 bg-white/12 p-4">
            <P className="text-xs text-white/80 uppercase">{label}</P>
            <P className="text-sm text-white">{value}</P>
        </Div>
    );
}

export function StatusChip({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
    return (
        <Div className={cn("min-w-24 rounded-2xl border px-4 py-3", muted ? "bg-muted" : "bg-primary/10")}>
            <P className="text-muted-foreground text-xs uppercase">{label}</P>
            <P className={cn("mt-1 text-sm", muted ? "text-muted-foreground" : "text-primary")}>{value}</P>
        </Div>
    );
}

export function SectionTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
    return (
        <Div className="gap-1">
            <Badge className="self-start" variant="outline">
                {eyebrow}
            </Badge>
            <H2 className="text-2xl">{title}</H2>
            <P className="text-muted-foreground text-sm">{note}</P>
        </Div>
    );
}
