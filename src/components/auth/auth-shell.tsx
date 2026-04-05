import { Image } from "react-native";
import { icons } from "@/constants/icons";
import { Link, LinkProps } from "expo-router";
import { Button } from "@/components/ui/button";
import { Badge, Card, Div, H1, P, Screen } from "@/components/ui/view";

interface AuthShellProps {
    title: string;
    subtitle: string;
    footerLabel?: string;
    footerHref?: LinkProps["href"];
    footerCta?: string;
    children: React.ReactNode;
}

export function AuthShell({ title, subtitle, footerLabel, footerHref, footerCta, children }: AuthShellProps) {
    return (
        <Screen className="px-5 py-6" nonScrollable={false}>
            <Div className="flex-1 justify-center gap-6">
                <Div className="items-center gap-4">
                    <Div className="bg-primary/12 border-primary/20 size-24 items-center justify-center rounded-[28px] border">
                        <Image source={icons.logo} resizeMode="contain" className="size-14" />
                    </Div>
                    <Badge variant="outline" className="bg-muted/60 rounded-full px-4 py-2">
                        Build your streak
                    </Badge>
                    <Div className="items-center gap-2">
                        <H1 className="text-center text-4xl font-extrabold tracking-tight">{title}</H1>
                        <P className="text-muted-foreground max-w-[320px] text-center text-base leading-6">{subtitle}</P>
                    </Div>
                </Div>

                <Card className="border-border/60 bg-background gap-5 rounded-4xl px-5 py-6">{children}</Card>

                {footerLabel && footerHref && footerCta && (
                    <Div className="row justify-center gap-2">
                        <P className="text-muted-foreground font-medium">{footerLabel}</P>
                        <Link href={footerHref} asChild>
                            <Button variant="link" size="sm" className="h-auto px-0">
                                {footerCta}
                            </Button>
                        </Link>
                    </Div>
                )}
            </Div>
        </Screen>
    );
}

export function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return <P className="text-destructive text-sm leading-5">{message}</P>;
}
