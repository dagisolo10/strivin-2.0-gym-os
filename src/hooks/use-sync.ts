import * as schema from "@/db/sqlite";
import { useEffect, useRef } from "react";
import { pushChanges, pullChanges } from "@/db/sync";
import NetInfo from "@react-native-community/netinfo";

export function useSync() {
    const isSyncing = useRef(false);

    useEffect(() => {
        const syncInitial = async () => {
            const state = await NetInfo.fetch();
            if (state.isConnected && state.isInternetReachable) {
                await performFullSync();
            }
        };

        syncInitial();

        const unsubscribe = NetInfo.addEventListener((state) => {
            if (state.isInternetReachable && state.isConnected) {
                console.log("Online! Triggering Sync...");
                performFullSync();
            }
        });
        return () => unsubscribe();
    }, []);

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
                await pushChanges(table.tableName, table.table);
                await pullChanges(table.tableName, table.table);
            }
            console.log("Sync Complete!");
        } catch (e) {
            console.error("Sync failed", e);
        } finally {
            isSyncing.current = false;
        }
    }
}
