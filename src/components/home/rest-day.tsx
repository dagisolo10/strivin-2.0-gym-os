import { MoonIcon } from "lucide-react-native";
import { Div, H3, P } from "@/components/ui/view";

export default function RestDay({ selectedDayName }: { selectedDayName: Weekday }) {
    return (
        <Div className="items-center justify-center px-10 py-12">
            <Div className="bg-muted/30 border-muted-foreground/30 mb-4 h-20 w-20 items-center justify-center rounded-full border border-dashed">
                <MoonIcon size={32} color="#666" opacity={0.5} />
            </Div>

            <H3 className="text-center text-xl font-bold tracking-tight">Rest & Recharge</H3>

            <P className="text-muted-foreground mt-2 text-center leading-5">No exercises scheduled for {selectedDayName}. Use this time to recover and let those muscles grow.</P>

            <Div className="bg-primary/10 border-primary/20 mt-6 rounded-2xl border px-4 py-2">
                <P className="text-primary text-xs font-bold tracking-widest uppercase">Growth happens here</P>
            </Div>
        </Div>
    );
}
