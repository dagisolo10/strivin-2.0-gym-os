import * as schema from "@/db/sqlite";
import { withRetry } from "@/db/high-order-fn";
import { pushChanges, pullChanges } from "@/db/sync";
import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSync({ enabled }: { enabled: boolean }) {
    const [isSyncingState, setIsSyncingState] = useState(false);
    const [lastError, setLastError] = useState<Error | null>(null);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    const isSyncing = useRef(false);

    const performFullSync = useCallback(async () => {
        if (isSyncing.current) return;

        isSyncing.current = true;
        setIsSyncingState(true);
        setLastError(null);

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
                try {
                    console.log(`🕛 Syncing ${table.tableName}...`);
                    await withRetry(async () => {
                        await pushChanges(table.tableName, table.table);
                        await pullChanges(table.tableName, table.table);
                    });
                    console.log(`✅ Successfully synced ${table.tableName}`);
                } catch (tableError) {
                    setLastError(tableError as Error);
                    console.error(`❌ Failed to sync ${table.tableName}:`, tableError);
                }
            }

            setLastSyncTime(new Date());
            console.log("✅ Sync Complete!");
        } finally {
            isSyncing.current = false;
            setIsSyncingState(false);
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;

        const unsubscribe = NetInfo.addEventListener((state) => {
            if (state.isInternetReachable && state.isConnected) {
                console.log("Online! Triggering Sync...");
                performFullSync().catch((e) => console.error("Sync triggered by network change failed", e));
            }
        });

        return () => unsubscribe();
    }, [enabled, performFullSync]);

    return { lastError, lastSyncTime, isSyncing: isSyncingState, forceSync: performFullSync };
}
