import { Badge, Card, Div, H1, P } from "../ui/display";

import { Ionicons } from "@expo/vector-icons";

export default function Finish() {
    return (
        <Card className="bg-accent items-center gap-4 rounded-4xl border-0 px-6 py-8">
            <Div className="size-20 items-center justify-center rounded-full bg-white/15">
                <Ionicons name="checkmark" size={42} color="#fff9e3" />
            </Div>
            <Badge variant="glass">Ready</Badge>
            <H1 className="text-center text-3xl text-white">Your plan is ready</H1>
            <P className="max-w-96 text-center text-white/85">You’ve got a local-first setup, a structured routine, and the base screens ready for logging and progression.</P>
        </Card>
    );
}
