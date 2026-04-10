import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/sqlite";
import { User } from "@/types/types";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { useOnboardingStore } from "@/store/use-onboarding-store";

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown | null>(null);
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

    const { supabaseUserId, session, setAuth, setLocalUserId } = useAuthStore();
    const resetOnboarding = useOnboardingStore((state) => state.reset);
    const previousSupabaseUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        let authEventReceived = false;
        const fetchInitialSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!cancelled && !authEventReceived) {
                setAuth(session);
            }
        };

        fetchInitialSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            authEventReceived = true;
            setAuth(session);
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [setAuth]);

    useEffect(() => {
        let cancelled = false;
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);
                   setUser(null);
                   setLocalUserId(null);

                if (!supabaseUserId) {
                    if (!cancelled) {
                        setUpdatedAt(new Date());
                    }
                    return;
                }

                const db = getDb();
                const userData = await db.select().from(users).where(eq(users.supabaseId, supabaseUserId)).limit(1);

                if (cancelled) return;

                const foundUser = userData[0] || null;
                setUser(foundUser);
                setLocalUserId(foundUser?.localId ?? null);
                setUpdatedAt(new Date());
            } catch (err) {
                if (cancelled) return;
                console.error("Error fetching user:", err);
                setError(err);
                setUpdatedAt(new Date());
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchUser();
        return () => {
            cancelled = true;
        };
    }, [supabaseUserId, setLocalUserId]);

    // Reset onboarding on user switch
    useEffect(() => {
        if (previousSupabaseUserIdRef.current !== null && previousSupabaseUserIdRef.current !== supabaseUserId) {
            resetOnboarding();
        }
        previousSupabaseUserIdRef.current = supabaseUserId;
    }, [supabaseUserId, resetOnboarding]);

    return { user, supabaseUserId, loading, error, updatedAt, session };
}
