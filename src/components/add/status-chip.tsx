import React from "react";
import { cn } from "@/lib/utils";
import { Div, P } from "@/components/ui/display";

export function StatusChip({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
    return (
        <Div className={cn("min-w-24 rounded-2xl border px-4 py-3", muted ? "bg-muted" : "bg-primary/10")}>
            <P className="text-muted-foreground text-xs uppercase">{label}</P>
            <P className={cn("mt-1 text-sm", muted ? "text-muted-foreground" : "text-primary")}>{value}</P>
        </Div>
    );
}
