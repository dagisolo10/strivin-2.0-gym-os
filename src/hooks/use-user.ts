import { eq } from "drizzle-orm";
import { users } from "@/db/sqlite";
import { User } from "@/types/types";
import { supabase } from "@/lib/supabase";
import { useDrizzle } from "@/context/db-provider";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useOnboardingStore } from "@/store/use-onboarding-store";

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<unknown | null>(null);
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
    const [authInitialized, setAuthInitialized] = useState(false);

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
                setAuthInitialized(true);
            }
        };

        fetchInitialSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            authEventReceived = true;
            setAuth(session);
            setAuthInitialized(true);
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [setAuth]);

    const db = useDrizzle();
    const { data: liveUser } = useLiveQuery(
        db.query.users.findFirst({
            where: eq(users.supabaseId, supabaseUserId ?? "__no_match__"),
        }),
        [supabaseUserId],
    );

    useEffect(() => {
        if (!authInitialized) return;

        if (!supabaseUserId) {
            setUser(null);
            setLocalUserId(null);
            setLoading(false);
            return;
        }

        if (liveUser === undefined) {
            setLoading(true);
            return;
        }

        setUser(liveUser ?? null);
        setLocalUserId(liveUser?.localId ?? null);
        setUpdatedAt(new Date());
        setLoading(false);
    }, [authInitialized, liveUser, supabaseUserId, setLocalUserId]);

    useEffect(() => {
        if (previousSupabaseUserIdRef.current !== null && previousSupabaseUserIdRef.current !== supabaseUserId) {
            resetOnboarding();
        }
        previousSupabaseUserIdRef.current = supabaseUserId;
    }, [supabaseUserId, resetOnboarding]);

    return { user, supabaseUserId, loading, error, updatedAt, session, authInitialized };
}
