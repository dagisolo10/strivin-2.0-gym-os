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

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");

    const handleGoogle = async () => {
        const redirectTo = makeRedirectUri({ scheme: "strivin-gym" });
        const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });

        if (error) setAuthError(error.message);
        if (data?.url) await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    };

    const onSignUp = async () => {
        if (isSubmitting) return;

        setAuthError(null);

        if (password !== confirmPassword) {
            setAuthError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error } = await supabase.auth.signUp({ email, password });

            if (error) return setAuthError(error.message);

            if (data.user && !data.session) {
                setIsVerifying(true);
            } else if (data.session) {
                router.replace("/onboarding");
            }
        } finally {
            setIsSubmitting(false);
        }
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
                            <Div className="relative">
                                <Input placeholder="********" value={password} onChangeText={setPassword} secureTextEntry={!passwordVisible} />
                                <Button onPress={() => setPasswordVisible((visible) => !visible)} className="absolute top-1/2 right-0 -translate-y-1/2 opacity-50" variant="ghost" size={"icon"}>
                                    {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                            </Div>
                        </Field>

                        <Field label="Confirm Password">
                            <Div className="relative">
                                <Input placeholder="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!confirmPasswordVisible} />
                                <Button onPress={() => setConfirmPasswordVisible((visible) => !visible)} className="absolute top-1/2 right-0 -translate-y-1/2 opacity-50" variant="ghost" size={"icon"}>
                                    {confirmPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                            </Div>
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
