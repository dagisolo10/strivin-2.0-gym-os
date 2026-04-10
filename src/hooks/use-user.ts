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

    // Auth listener
    useEffect(() => {
        const fetchInitialSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setAuth(session);
        };

        fetchInitialSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuth(session);
        });

        return () => subscription.unsubscribe();
    }, [setAuth]);

    // Fetch user when supabaseUserId changes
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!supabaseUserId) {
                    setUser(null);
                    setLocalUserId(null);
                    setUpdatedAt(new Date());
                    return;
                }

                const db = getDb();
                const userData = await db.select().from(users).where(eq(users.supabaseId, supabaseUserId)).limit(1);

                const foundUser = userData[0] || null;
                setUser(foundUser);
                setLocalUserId(foundUser?.localId ?? null);
                setUpdatedAt(new Date());
            } catch (err) {
                console.error("Error fetching user:", err);
                setError(err);
                setUpdatedAt(new Date());
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
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
