import { P } from "./view";

import { cn } from "@/lib/utils";
import * as Haptics from "expo-haptics";
import { Link, LinkProps } from "expo-router";
import { VariantProps, cva } from "class-variance-authority";
import { PressableProps, GestureResponderEvent, Pressable, TextInput, TextInputProps } from "react-native";

interface ButtonProps extends PressableProps, VariantProps<typeof buttonVariants> {
    children: React.ReactNode;
    className?: string;
    textClassName?: string;
}

const buttonVariants = cva("h-12 flex-row items-center justify-center rounded-xl px-6 active:opacity-70", {
    variants: {
        variant: {
            primary: "bg-primary",
            success: "bg-success",
            secondary: "bg-accent",
            destructive: "bg-destructive",
            outline: "border border-border bg-transparent",
            ghost: "bg-transparent",
            link: "bg-transparent px-0 h-auto",
        },

        size: {
            default: "h-12 px-6",
            sm: "h-9 px-3 rounded-lg",
            lg: "h-14 px-8 rounded-2xl",
            icon: "size-12 px-0",
        },
    },

    defaultVariants: {
        variant: "primary",
        size: "default",
    },
});

const textVariants = {
    primary: "text-background",
    success: "text-foreground",
    secondary: "text-foreground",
    destructive: "text-foreground",
    outline: "text-foreground",
    ghost: "text-foreground",
    link: "text-primary underline",
};

export const Button = ({ variant = "primary", size = "default", children, className, textClassName, onPress, component = false, ...props }: ButtonProps & { component?: boolean }) => {
    const handlePress = (e: GestureResponderEvent) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
    };

    const renderContent = () => (!component ? <P className={cn("font-semibold", variant && textVariants[variant], textClassName)}>{children}</P> : children);

    return (
        <Pressable onPress={handlePress} className={cn(buttonVariants({ className, variant, size }))} {...props}>
            {renderContent}
        </Pressable>
    );
};

export const NavLink = ({ children, href, className, textClassName }: { children: React.ReactNode; href: LinkProps["href"]; className?: string; textClassName?: string }) => (
    <Link href={href} asChild>
        <Pressable className={cn("active:opacity-70", className)}>
            <P className={cn("text-accent font-sans-medium", textClassName)}>{children}</P>
        </Pressable>
    </Link>
);

export const Input = ({ className, ...props }: TextInputProps & { className?: string }) => <TextInput placeholderTextColor="#999999" className={cn("border-border bg-background text-foreground h-12 w-full rounded-xl border pl-4", className)} {...props} />;
