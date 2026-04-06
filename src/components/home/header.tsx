import { Image } from "react-native";
import { formatDateLabel } from "@/lib/helper-functions";
import { Div, H2, P, Row } from "@/components/ui/display";
import { UserWithRelations } from "@/store/use-static-store";

interface HeaderProp {
    user: UserWithRelations;
    todayKey: string;
}

export default function Header({ user, todayKey }: HeaderProp) {
    return (
        <Row className="items-center">
            <Div className="items-start gap-2">
                <Row className="gap-3">
                    <Image className="border-border size-14 rounded-full border" source={user.profile ? { uri: user.profile } : require("../../../assets/images/profile.jpg")} />
                    <Div>
                        <P className="text-muted-foreground text-sm">Good Evening</P>
                        <H2>{user.name}</H2>
                    </Div>
                </Row>
            </Div>
            <Div className="items-end">
                <P className="text-muted-foreground text-sm">Today</P>
                <P className="text-xl">{formatDateLabel(todayKey)}</P>
            </Div>
        </Row>
    );
}
