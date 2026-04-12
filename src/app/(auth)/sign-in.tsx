import { useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import * as WebBrowser from "expo-web-browser";
import { ActivityIndicator } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { makeRedirectUri } from "expo-auth-session";
import { Div, Field, P } from "@/components/ui/display";
import { Button, Input } from "@/components/ui/interactive";
import { AuthShell, Divider, SocialButton } from "@/components/auth/auth-shell";

export default function SignIn() {
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSignIn = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setAuthError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return setAuthError(error.message);
            if (data.session) router.replace("/(tabs)/home");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogle = async () => {
        const redirectTo = makeRedirectUri({ scheme: "strivin-gym" });
        const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });

        if (error) setAuthError(error.message);
        if (data?.url) await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    };

    return (
        <AuthShell title="Welcome Back" subtitle="Sign in to continue your journey." footerLabel="Need an account?" footerHref="/(auth)/sign-up" footerCta="Create one">
            <Div className="gap-4">
                <Field label="Email">
                    <Input placeholder="you@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" />
                </Field>

                <Field label="Password">
                    <Div>
                        <Input placeholder="********" value={password} onChangeText={setPassword} secureTextEntry={!passwordVisible} />
                        <Button onPress={() => setPasswordVisible((visible) => !visible)} className="absolute top-1/2 right-0 -translate-y-1/2 opacity-50" variant="ghost" size={"icon"}>
                            {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                    </Div>
                </Field>

                <Divider />
                <SocialButton onPress={handleGoogle} />

                {authError && <P className="text-destructive text-center text-sm">{authError}</P>}

                <Button onPress={onSignIn} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="#fff" /> : "Sign In"}
                </Button>
            </Div>
        </AuthShell>
    );
}
