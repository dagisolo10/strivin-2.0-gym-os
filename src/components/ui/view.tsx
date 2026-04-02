import * as React from "react";
import { cn } from "@/lib/utils";
import { styled } from "nativewind";
import { Text, TextProps, View, ViewProps } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { ScrollView, GestureHandlerRootView } from "react-native-gesture-handler";

const SafeAreaView = styled(RNSafeAreaView);

interface ThemedViewProps extends ViewProps {
    className?: string;
}

interface TypographyProps extends TextProps {
    className?: string;
}

export const Screen = ({ className, children, ...props }: ThemedViewProps) => (
    <SafeAreaView className="bg-dead-zone dark flex-1">
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView className={cn("bg-background")} contentContainerStyle={{ flexGrow: 1 }} {...props}>
                <Div className={cn("flex-1", className)}>{children}</Div>
            </ScrollView>
        </GestureHandlerRootView>
    </SafeAreaView>
);

export const Div = ({ className, ...props }: ThemedViewProps) => <View className={cn("border-border", className)} {...props} />;
export const Card = ({ className, ...props }: ThemedViewProps) => <Div className={cn("rounded-2xl border p-4 shadow-sm", className)} {...props} />;
export const Row = ({ className, ...props }: ThemedViewProps) => <View className={cn("border-border flex-row items-center justify-between", className)} {...props} />;
export const Center = ({ className, ...props }: ThemedViewProps) => <View className={cn("border-border items-center justify-center", className)} {...props} />;

/** Typography **/

export const H1 = ({ className, ...props }: TypographyProps) => <Text className={cn("text-foreground text-4xl font-bold", className)} {...props} />;
export const H2 = ({ className, ...props }: TypographyProps) => <Text className={cn("text-foreground text-3xl font-semibold", className)} {...props} />;
export const H3 = ({ className, ...props }: TypographyProps) => <Text className={cn("text-foreground text-2xl font-semibold", className)} {...props} />;
export const P = ({ className, ...props }: TypographyProps) => <Text className={cn("text-foreground text-base", className)} {...props} />;
export const Lead = ({ className, ...props }: TypographyProps) => <Text className={cn("text-muted-foreground text-lg", className)} {...props} />;
export const Label = ({ className, ...props }: TypographyProps) => <Text className={cn("text-muted-foreground my-1.5 ml-1 font-semibold", className)} {...props} />;
