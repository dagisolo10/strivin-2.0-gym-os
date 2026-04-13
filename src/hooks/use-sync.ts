import * as schema from "@/db/sqlite";
import { useEffect, useRef } from "react";
import { pushChanges, pullChanges } from "@/db/sync";
import NetInfo from "@react-native-community/netinfo";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3, baseDelay = 1000): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            if (error.message?.includes("constraint") || error.status === 400) throw error;

            if (attempt < maxAttempts) {
                const waitTime = baseDelay * Math.pow(2, attempt - 1); // 1s, 2s, 4s
                console.warn(`Sync attempt ${attempt} failed. Retrying in ${waitTime}ms...`);
                await delay(waitTime);
            }
        }
    }
    throw lastError;
}

export function useSync({ enabled }: { enabled: boolean }) {
    const isSyncing = useRef(false);

    async function performFullSync() {
        if (isSyncing.current) return;
        isSyncing.current = true;

        try {
            const tables = [
                { tableName: "users", table: schema.users },
                { tableName: "workout_plans", table: schema.workoutPlans },
                { tableName: "workout_days", table: schema.workoutDays },
                { tableName: "exercises", table: schema.exercises },
                { tableName: "workout_sessions", table: schema.workoutSessions },
                { tableName: "exercise_logs", table: schema.exerciseLogs },
            ];

            for (const table of tables) {
                console.log(`Syncing ${table.tableName}...`);

                await withRetry(async () => {
                    await pushChanges(table.tableName, table.table);
                    await pullChanges(table.tableName, table.table);
                });

                console.log(`Successfully synced ${table.tableName}`);
            }
            console.log("Sync Complete!");
        } catch (e) {
            console.error("Sync aborted due to critical error:", e);
        } finally {
            isSyncing.current = false;
        }
    }

    useEffect(() => {
        if (!enabled) return;

        const syncInitial = async () => {
            const state = await NetInfo.fetch();
            if (state.isConnected && state.isInternetReachable) await performFullSync();
        };

        syncInitial();

        const unsubscribe = NetInfo.addEventListener((state) => {
            if (state.isInternetReachable && state.isConnected) {
                console.log("Online! Triggering Sync...");
                performFullSync().catch((e) => console.error("Sync triggered by network change failed", e));
            }
        });

        return () => unsubscribe();
    }, [enabled]);
}
