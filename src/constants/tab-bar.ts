import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

const primaryColor = "#527bda";
const tabBar = { height: 72, horizontalInset: 20, radius: 48, iconFrame: 48, itemPaddingVertical: 8 };

export function useTabScreenOptions() {
    const insets = useSafeAreaInsets();

    const tabBarOptions: BottomTabNavigationOptions = {
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
            position: "absolute",
            bottom: Math.max(insets.bottom, tabBar.horizontalInset) + 20,
            height: tabBar.height,
            marginHorizontal: tabBar.horizontalInset,
            borderRadius: tabBar.radius,
            backgroundColor: primaryColor,
            borderTopWidth: 0,
            elevation: 0,
            overflow: "hidden",
        },
        tabBarItemStyle: {
            paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
            width: tabBar.iconFrame,
            height: tabBar.iconFrame,
            alignSelf: "center",
        },
    };
    return tabBarOptions;
}