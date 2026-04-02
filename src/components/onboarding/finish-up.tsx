import { P } from "../ui/view";

import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function Finish() {
    return (
        <Animated.View entering={FadeInUp} className="items-center gap-4">
            <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
            <P className="text-center text-zinc-400">Everything is synced. Your journey starts now.</P>
        </Animated.View>
    );
}
