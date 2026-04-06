import React from "react";
import { Div, P } from "@/components/ui/display";

export function HeroPill({ label, value }: { label: string; value: string }) {
    return (
        <Div className="flex-1 gap-1 rounded-3xl border border-white/20 bg-white/12 p-4">
            <P className="text-xs text-white/80 uppercase">{label}</P>
            <P className="text-sm text-white">{value}</P>
        </Div>
    );
}
