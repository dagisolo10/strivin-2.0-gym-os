import React from "react";
import { cn } from "@/lib/utils";
import { Tabs } from "expo-router";
import { Image } from "react-native";
import { icons } from "@/constants/icons";
import { Div } from "@/components/ui/view";
import { ScreenOptions } from "@/constants/tab-bar";

export default function TabLayout() {
    return (
        <Tabs screenOptions={ScreenOptions()}>
            <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.wallet} /> }} />
            <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.setting} /> }} />
        </Tabs>
    );
}

export function TabIcon({ focused, icon }: TabIconProps) {
    return (
        <Div className="tabs-icon">
            <Div className={cn("tabs-pill", focused && "tabs-active")}>
                <Image source={icon} resizeMode="contain" className="size-6" />
            </Div>
        </Div>
    );
}
