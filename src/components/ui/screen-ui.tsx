import { Button } from "./interactive";
import { H2, P, Screen } from "./display";

import { Link, LinkProps } from "expo-router";
import { ActivityIndicator } from "react-native";

export function ErrorScreen({ message = "Something went wrong", href = "/", button = "Go Home" }: { message?: string; href?: LinkProps["href"]; button?: string }) {
    return (
        <Screen className="items-center justify-center gap-4 px-6">
            <H2 className="text-center">{message}</H2>
            {href && (
                <Link href={href} asChild>
                    <Button className="h-14 rounded-2xl">{button}</Button>
                </Link>
            )}
        </Screen>
    );
}

export function LoadingScreen() {
    return (
        <Screen className="items-center justify-center">
            <ActivityIndicator size="large" />
        </Screen>
    );
}

export function ErrorMessage({ message }: { message?: string }) {
    if (!message) return null;
    return <P className="text-destructive mt-2 text-sm">{message}</P>;
}
