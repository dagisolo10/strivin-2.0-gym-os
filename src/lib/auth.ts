export const PASSWORD_REQUIREMENTS = ["At least 8 characters", "One uppercase letter", "One lowercase letter", "One number"];

export function isStrongPassword(password: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

type OAuthResource = {
    createdSessionId?: string | null;
    status?: string | null;
    reload?: (params?: Record<string, unknown>) => Promise<unknown>;
};

type OAuthResult = {
    createdSessionId: string | null;
    signIn?: OAuthResource;
    signUp?: OAuthResource;
};

export async function resolveOAuthSessionId(result: OAuthResult) {
    return result.createdSessionId ?? result.signIn?.createdSessionId ?? result.signUp?.createdSessionId ?? null;
}

export function getClerkErrorMessage(error: any) {
    const clerkErrors = error?.errors;

    if (Array.isArray(clerkErrors) && clerkErrors.length > 0) {
        return clerkErrors.map((item) => item.longMessage || item.message || "Authentication failed").join("\n");
    }

    if (error?.message) return error.message;

    if (typeof error === "string") return error;

    return "Something went wrong. Please try again.";
}
