import { Ionicons } from "@expo/vector-icons";
import { StyleProp, ViewStyle } from "react-native";
import Animated, { AnimatedStyle, FadeInRight, FadeOutLeft } from "react-native-reanimated";

export default function FloatingBarbell({ style }: { style: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>> }) {
    return (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="items-center justify-center py-4">
            <Animated.View style={style}>
                <Ionicons name="barbell-outline" size={80} color="#3b82f6" />
            </Animated.View>
        </Animated.View>
    );
}
