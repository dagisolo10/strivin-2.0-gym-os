import React from "react";
import { Div, Badge, H2, P } from "@/components/ui/display";

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
