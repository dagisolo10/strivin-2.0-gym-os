import { P } from "./display";

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

const buttonVariants = cva("flex-row items-center justify-center rounded-2xl px-6 data-disabled:opacity-50", {
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
            default: "h-14 px-6",
            lg: "h-16 px-8",
            sm: "h-9 px-3 rounded-xl",
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
    success: "text-background",
    secondary: "text-background",
    destructive: "text-white",
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

const navLinkTextVariants = {
    primary: "text-background",
    success: "text-background",
    secondary: "text-background",
    destructive: "text-foreground",
    outline: "text-foreground",
    ghost: "text-foreground",
    link: "text-accent underline",
};

export const NavLink = ({ href, variant = "link", size = "default", children, className, textClassName, onPress, component = false, ...props }: ButtonProps & { href: LinkProps["href"]; component?: boolean }) => {
    const handlePress = (e: GestureResponderEvent) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
    };
    const renderContent = () => (!component ? <P className={cn("font-sans-medium", variant && navLinkTextVariants[variant], textClassName)}>{children}</P> : children);

    return (
        <Link href={href} asChild>
            <Button onPress={handlePress} variant={variant} size={size} className={className} {...props}>
                {renderContent()}
            </Button>
        </Link>
    );
};

export const Input = ({ className, ...props }: TextInputProps & { className?: string }) => (
    <TextInput placeholderTextColor="#999999" className={cn("border-border bg-background text-foreground h-14 w-full rounded-2xl border pl-4 text-base", className)} {...props} />
);
