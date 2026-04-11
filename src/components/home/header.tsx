import { Image } from "react-native";
import { UserWithPlanOnly } from "@/types/types";
import { Div, H2, P, Row } from "@/components/ui/display";
import { formatDateLabel, getDateKey } from "@/lib/helper-functions";

export default function Header({ user }: { user: UserWithPlanOnly }) {
    const hour = new Date().getHours();
    const greeting = hour >= 18 ? "Evening" : hour >= 12 ? "Afternoon" : "Morning";

    return (
        <Row className="items-center">
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
                <P className="text-muted-foreground text-sm">Today</P>
                <P className="text-xl">{formatDateLabel(getDateKey())}</P>
            </Div>
        </Row>
    );
}
