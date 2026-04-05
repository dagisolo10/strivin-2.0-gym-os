import React from "react";
import { cn } from "@/lib/utils";
import { Tabs } from "expo-router";
import { Image } from "react-native";
import { icons } from "@/constants/icons";
import { Div } from "@/components/ui/view";
import { useTabScreenOptions } from "@/constants/tab-bar";

export default function TabLayout() {
    const options = useTabScreenOptions();

    return (
        <Tabs screenOptions={options}>
            <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.home} /> }} />
            <Tabs.Screen name="add" options={{ title: "Add", tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.plus} /> }} />
            <Tabs.Screen name="progress" options={{ title: "Progress", tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.activity} /> }} />
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
