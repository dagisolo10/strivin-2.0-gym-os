import { Tabs } from "expo-router";
import { icons } from "@/constants/icons";
import { Image, StyleSheet } from "react-native";
import { GlassTabBar } from "@/components/ui/glass-tab-bar";

export default function TabLayout() {
    return (
        <Tabs tabBar={(props) => <GlassTabBar {...props} />} screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="home" options={{ tabBarIcon: ({ focused }) => <Image source={icons.home} style={[styles.icon, { tintColor: focused ? "#fff" : "#ccc" }]} /> }} />
            <Tabs.Screen name="add" options={{ tabBarIcon: ({ focused }) => <Image source={icons.plus} style={[styles.icon, { tintColor: focused ? "#fff" : "#ccc" }]} /> }} />
            <Tabs.Screen name="exercises" options={{ tabBarIcon: ({ focused }) => <Image source={icons.spotify} style={[styles.icon, { tintColor: focused ? "#fff" : "#ccc" }]} /> }} />
            <Tabs.Screen name="progress" options={{ tabBarIcon: ({ focused }) => <Image source={icons.activity} style={[styles.icon, { tintColor: focused ? "#fff" : "#ccc" }]} /> }} />
            <Tabs.Screen name="settings" options={{ tabBarIcon: ({ focused }) => <Image source={icons.setting} style={[styles.icon, { tintColor: focused ? "#fff" : "#ccc" }]} /> }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({ icon: { width: 24, height: 24 } });
