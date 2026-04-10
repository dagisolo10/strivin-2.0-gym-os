import { useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import * as WebBrowser from "expo-web-browser";
import { ActivityIndicator } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import { Div, Field, P } from "@/components/ui/display";
import { Button, Input } from "@/components/ui/interactive";
import { AuthShell, Divider, SocialButton } from "@/components/auth/auth-shell";

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");

    const handleGoogle = async () => {
        const redirectTo = makeRedirectUri({ scheme: "strivin-gym" });
        const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });

        if (error) setAuthError(error.message);
        if (data?.url) await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    };

    const onSignUp = async () => {
        console.log("Starting sign up for:", email);

        setAuthError(null);
        setIsSubmitting(true);

        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) return setAuthError(error.message);

        if (data.user && !data.session) {
            setIsVerifying(true);
        } else if (data.session) {
            router.replace("/onboarding");
        }
        setIsSubmitting(false);
    };

    const onVerify = async () => {
        setAuthError(null);
        const { data, error } = await supabase.auth.verifyOtp({ email, token: verificationCode, type: "signup" });

        if (error) return setAuthError(error.message);
        if (data.session) router.replace("/onboarding");
    };

    return (
        <AuthShell
            title={isVerifying ? "Verify Email" : "Create Account"}
            subtitle={isVerifying ? "Enter the code sent to your inbox." : "Start your routine today."}
            footerLabel="Already have an account?"
            footerHref="/(auth)/sign-in"
            footerCta="Sign in">
            <Div className="gap-4">
                {!isVerifying ? (
                    <>
                        <Field label="Email">
                            <Input placeholder="you@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" />
                        </Field>

                        <Field label="Password">
                            <Input placeholder="********" value={password} onChangeText={setPassword} secureTextEntry />
                        </Field>

                        <Divider />
                        <SocialButton onPress={handleGoogle} />

                        <Button onPress={onSignUp} disabled={isSubmitting}>
                            {isSubmitting ? <ActivityIndicator color="#fff" /> : "Create Account"}
                        </Button>
                    </>
                ) : (
                    <>
                        <Field label="6-Digit Code">
                            <Input placeholder="123456" value={verificationCode} onChangeText={setVerificationCode} keyboardType="numeric" maxLength={6} />
                        </Field>

                        <Button onPress={onVerify}>Verify & Continue</Button>
                        <Button variant="ghost" onPress={() => setIsVerifying(false)}>
                            Back
                        </Button>
                    </>
                )}
                {authError && <P className="text-destructive text-center text-sm">{authError}</P>}
            </Div>
        </AuthShell>
    );
}
