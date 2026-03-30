import { cn } from "@/lib/utils";
import { Link } from "expo-router";
import * as Haptics from "expo-haptics";
import { VariantProps, cva } from "class-variance-authority";
import { PressableProps, GestureResponderEvent, Pressable, Text, TextInput, TextInputProps } from "react-native";

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
            link: "bg-transparent px-0 h-auto"
        },

        size: {
            default: "h-12 px-6",
            sm: "h-9 px-3 rounded-lg",
            lg: "h-14 px-8 rounded-2xl",
            icon: "size-12 px-0"
        }
    },

    defaultVariants: {
        variant: "primary",
        size: "default"
    }
});

const textVariants = {
    primary: "text-background dark:text-foreground",
    success: "text-foreground",
    secondary: "text-foreground",
    destructive: "text-foreground",
    outline: "text-foreground",
    ghost: "text-foreground",
    link: "text-primary underline"
};

export const Button = ({ variant = "primary", size = "default", children, className, textClassName, onPress, ...props }: ButtonProps) => {
    const handlePress = (e: GestureResponderEvent) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
    };

    return (
        <Pressable onPress={handlePress} className={cn(buttonVariants({ variant, size, className }))} {...props}>
            <Text className={cn("font-black", variant && textVariants[variant], textClassName)}>{children}</Text>
        </Pressable>
    );
};

export const NavLink = ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <Link href={href as any} asChild>
        <Pressable className={cn("active:opacity-70", className)}>
            <Text className="text-accent font-medium">{children}</Text>
        </Pressable>
    </Link>
);

export const Input = ({ className, ...props }: TextInputProps & { className?: string }) => <TextInput placeholderTextColor="#999999" className={cn("border-border bg-background text-foreground h-12 w-full rounded-xl border px-8", className)} {...props} />;
