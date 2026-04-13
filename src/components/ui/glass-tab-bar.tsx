import { useEffect } from "react";
import { BlurView } from "expo-blur";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet, Pressable, Dimensions, useWindowDimensions } from "react-native";
import { BottomTabBarProps, BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from "react-native-reanimated";

const { width } = Dimensions.get("window");
let TAB_BAR_WIDTH = width - 40;
const TAB_HEIGHT = 66;

const SPRING_CONFIG = {
    damping: 16,
    stiffness: 150,
    mass: 1,
};

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    TAB_BAR_WIDTH = width - 40;
    const totalTabs = state.routes.length;
    const tabWidth = TAB_BAR_WIDTH / totalTabs;
    const translateX = useSharedValue(state.index * tabWidth);

    useEffect(() => {
        translateX.value = withSpring(state.index * tabWidth, SPRING_CONFIG);
    }, [state.index, tabWidth, translateX]);

    const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

    return (
        <View style={[styles.container, { bottom: Math.max(insets.bottom, 20) + 12 }]}>
            <BlurView intensity={60} tint="systemThickMaterialDark" style={styles.blurContainer}>
                <View style={styles.content}>
                    <Animated.View style={[styles.indicator, { width: tabWidth - 12 }, indicatorStyle]} />
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;
                        const onPress = () => {
                            impactAsync(ImpactFeedbackStyle.Light);
                            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                        };
                        const onLongPress = () => navigation.emit({ type: "tabLongPress", target: route.key });
                        return <TabItem key={route.key} isFocused={isFocused} onPress={onPress} onLongPress={onLongPress} options={options} tabWidth={tabWidth} />;
                    })}
                </View>
            </BlurView>
        </View>
    );
}
interface TabItemProps {
    isFocused: boolean;
    onPress: () => void;
    onLongPress: () => void;
    options: BottomTabNavigationOptions;
    tabWidth: number;
}

function TabItem({ isFocused, onPress, onLongPress, options, tabWidth }: TabItemProps) {
    const scale = useSharedValue(1);
    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: withSpring(isFocused ? -2 : 0, SPRING_CONFIG) }],
            opacity: withTiming(isFocused ? 1 : 0.6, { duration: 200 }),
        };
    });

    const handlePressIn = () => (scale.value = withTiming(0.9, { duration: 100 }));
    const handlePressOut = () => (scale.value = withSpring(1, SPRING_CONFIG));

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{ width: tabWidth, height: TAB_HEIGHT, alignItems: "center", justifyContent: "center" }}>
            <Animated.View style={animatedIconStyle}>{options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color: "", size: 0 }) : null}</Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        alignSelf: "center",
        width: TAB_BAR_WIDTH,
        height: TAB_HEIGHT,
        borderRadius: 48,
        overflow: "hidden",
        backgroundColor: "#ea7a5333",
        borderColor: "#ffffff1f",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    blurContainer: {
        flex: 1,
    },
    content: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5,
    },
    indicator: {
        position: "absolute",
        height: TAB_HEIGHT - 12,
        borderRadius: 48,
        backgroundColor: "#ea7a53b3",
        left: 5,
    },
});
