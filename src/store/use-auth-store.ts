import { create } from "zustand";
import { Session } from "@supabase/supabase-js";

interface AuthState {
    localUserId: string | null;
    supabaseUserId: string | null;
    session: Session | null;

    setAuth: (session: Session | null) => void;
    setLocalUserId: (localId: string | null) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    localUserId: null,
    supabaseUserId: null,
    session: null,

    setAuth: (session) =>
        set({
            session,
            supabaseUserId: session?.user?.id ?? null,
        }),

    setLocalUserId: (localId) => set({ localUserId: localId }),

    clearAuth: () =>
        set({
            localUserId: null,
            supabaseUserId: null,
            session: null,
        }),
}));
