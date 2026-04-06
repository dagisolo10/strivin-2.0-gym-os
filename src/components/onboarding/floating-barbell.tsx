import { Card, Div, H3, P } from "../ui/display";

import { Ionicons } from "@expo/vector-icons";
import { StyleProp, ViewStyle } from "react-native";
import Animated, { AnimatedStyle, FadeInRight, FadeOutLeft } from "react-native-reanimated";

export default function Intro({ style }: { style: AnimatedStyle<StyleProp<ViewStyle>> }) {
    return (
        <Card variant={"muted"} className="items-center rounded-4xl py-10">
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="items-center justify-center py-4">
                <Animated.View style={style}>
                    <Ionicons name="barbell-outline" size={80} color="#3b82f6" />
                </Animated.View>
            </Animated.View>

            <Div className="gap-3">
                <H3 className="text-center">Build your training system once, then log everything locally without friction.</H3>
                <P className="text-muted-foreground text-center">We&apos;ll set up your split, weekly schedule, and the first version of your routine.</P>
            </Div>
        </Card>
    );
}
