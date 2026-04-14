import { Tabs } from "expo-router";
import { GlassTabBar } from "@/components/ui/glass-tab-bar";
import { Home, Dumbbell, Zap, Settings, Plus } from "lucide-react-native";

export default function TabLayout() {
    const iconSize = 24;
    const activeColor = "#fff";
    const inactiveColor = "#ccc";

    return (
        <Tabs tabBar={(props) => <GlassTabBar {...props} />} screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="home" options={{ tabBarIcon: ({ focused }) => <Home size={iconSize} color={focused ? activeColor : inactiveColor} /> }} />
            <Tabs.Screen name="exercises" options={{ tabBarIcon: ({ focused }) => <Dumbbell size={iconSize} color={focused ? activeColor : inactiveColor} /> }} />
            <Tabs.Screen name="add" options={{ tabBarIcon: ({ focused }) => <Plus size={iconSize * 1.5} color={focused ? activeColor : inactiveColor} /> }} />
            <Tabs.Screen name="progress" options={{ tabBarIcon: ({ focused }) => <Zap size={iconSize} color={focused ? activeColor : inactiveColor} /> }} />
            <Tabs.Screen name="settings" options={{ tabBarIcon: ({ focused }) => <Settings size={iconSize} color={focused ? activeColor : inactiveColor} /> }} />
        </Tabs>
    );
}
