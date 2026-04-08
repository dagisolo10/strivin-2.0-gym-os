import { enqueueWrite } from "@/db/write-queue";
import { useDrizzle } from "./db-provider";

import { eq } from "drizzle-orm";
import * as schema from "@/db/sqlite";
import { randomUUID } from "expo-crypto";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    localId: string;
    name: string;
    profile: string | null;
    createdAt: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (name: string, profile?: string | null) => Promise<User>;
    signOut: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const db = useDrizzle();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from database on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const users = await db.select().from(schema.users).limit(1);
                if (users.length > 0) {
                    setUser(users[0]);
                }
            } catch (error) {
                console.error("Error loading user:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, [db]);

    const signIn = async (name: string, profile: string | null = null): Promise<User> => {
        const nextUser = await enqueueWrite(() =>
            db.transaction(async (tx) => {
                const existingUser = await tx.query.users.findFirst();

                if (existingUser) {
                    const [updated] = await tx.update(schema.users).set({ name, profile }).where(eq(schema.users.localId, existingUser.localId)).returning();
                    return updated;
                }

                const [newUser] = await tx.insert(schema.users).values({ name, profile, serverId: randomUUID(), localId: randomUUID() }).returning();
                return newUser;
            }),
        );

        setUser(nextUser);
        return nextUser;
    };

    const signOut = async () => {
        // For local auth, we just clear the state
        // Optionally delete the user: await db.delete(schema.users);
        setUser(null);
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!user) return;
        const [updated] = await enqueueWrite(() => db.update(schema.users).set(updates).where(eq(schema.users.localId, user.localId)).returning());
        setUser(updated);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                signIn,
                signOut,
                updateUser,
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
