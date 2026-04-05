import * as React from "react";
import { cn } from "@/lib/utils";
import { styled } from "nativewind";
import { ScrollView } from "react-native-gesture-handler";
import { cva, VariantProps } from "class-variance-authority";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform, Text, TextProps, View, ViewProps } from "react-native";

const SafeAreaView = styled(RNSafeAreaView);

interface ThemedViewProps extends ViewProps {
    className?: string;
}

interface TypographyProps extends TextProps {
    className?: string;
}

export const Screen = ({ className, children, nonScrollable = false, ...props }: ThemedViewProps & { nonScrollable?: boolean }) => (
    <SafeAreaView className="bg-dead-zone flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
            {nonScrollable ? (
                <Div className={cn("bg-background flex-1", className)} {...props}>
                    {children}
                </Div>
            ) : (
                <ScrollView className={cn("bg-background")} contentContainerStyle={{ flexGrow: 1 }} {...props}>
                    <Div className={cn("flex-1", className)}>{children}</Div>
                </ScrollView>
            )}
        </KeyboardAvoidingView>
    </SafeAreaView>
);

export const Separator = ({ vertical = false, size = 16 }: { vertical?: boolean; size?: number }) => <Div style={{ height: vertical ? size : 0, width: vertical ? 0 : size }} />;
export const Div = ({ className, ...props }: ThemedViewProps) => <View className={cn("border-border", className)} {...props} />;
export const Card = ({ className, ...props }: ThemedViewProps) => <Div className={cn("rounded-2xl border p-4 shadow-sm", className)} {...props} />;
export const Row = ({ className, ...props }: ThemedViewProps) => <View className={cn("border-border flex-row items-center justify-between", className)} {...props} />;
export const Center = ({ className, ...props }: ThemedViewProps) => <View className={cn("border-border items-center justify-center", className)} {...props} />;

/** Typography **/

export const H1 = ({ className, ...props }: TypographyProps) => <Text className={cn("text-foreground text-4xl font-bold", className)} {...props} />;
export const H2 = ({ className, ...props }: TypographyProps) => <Text className={cn("text-foreground text-3xl font-semibold", className)} {...props} />;
export const H3 = ({ className, ...props }: TypographyProps) => <Text className={cn("text-foreground text-2xl font-semibold", className)} {...props} />;
export const P = ({ className, ...props }: TypographyProps) => <Text className={cn("text-foreground text-base font-semibold", className)} {...props} />;
export const Lead = ({ className, ...props }: TypographyProps) => <Text className={cn("text-muted-foreground text-lg font-semibold", className)} {...props} />;
export const Label = ({ className, ...props }: TypographyProps) => <Text className={cn("text-muted-foreground my-1.5 font-bold", className)} {...props} />;

const badgeVariants = cva("inline-flex flex-row items-center justify-center rounded-full px-2.5 py-0.5 border", {
    variants: {
        variant: {
            primary: "bg-primary border-transparent",
            success: "bg-success border-transparent",
            secondary: "bg-accent border-transparent",
            destructive: "bg-destructive border-transparent",
            outline: "border-border bg-transparent",
            muted: "bg-muted border-transparent",
            glass: "bg-white/20 border-white/10",
        },
    },
    defaultVariants: {
        variant: "primary",
    },
});

const badgeTextVariants = {
    primary: "text-white",
    success: "text-white",
    secondary: "text-white",
    destructive: "text-white",
    outline: "text-foreground",
    muted: "text-muted-foreground",
    glass: "text-white",
};

interface BadgeProps extends ThemedViewProps, VariantProps<typeof badgeVariants> {
    textClassName?: string;
}

export const Badge = ({ variant = "primary", children, className, textClassName, ...props }: BadgeProps) => {
    return (
        <Div className={cn(badgeVariants({ variant, className }))} {...props}>
            <P className={cn("text-sm font-bold tracking-wider uppercase", badgeTextVariants[variant || "primary"], textClassName)}>{children}</P>
        </Div>
    );
};
