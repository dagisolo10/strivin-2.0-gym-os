import { getDb } from "./client";
import { syncMetadata } from "./sqlite";

import { eq, inArray } from "drizzle-orm";
import { supabase } from "@/lib/supabase";
import NetInfo from "@react-native-community/netinfo";
import { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import { mapToSnakeCase, mapToCamelCase } from "@/lib/helper-functions";

export async function pushChanges<T extends AnySQLiteTable>(tableName: string, schemaTable: T & { syncStatus: any; localId: any }) {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return;

    const db = getDb();
    const pendingRecords = await db.select().from(schemaTable).where(eq(schemaTable.syncStatus, "pending"));

    if (pendingRecords.length === 0) return;

    const recordToPush = pendingRecords.map((record) => {
        const data = mapToSnakeCase(record, tableName);

        if (tableName === "workout_plans" && data.workout_days_per_week) {
            data.days_per_week = data.workout_days_per_week;
            delete data.workout_days_per_week;
        }

        data.sync_status = "synced";
        return data;
    });

    const { error } = await supabase.from(tableName).upsert(recordToPush);

    if (!error) {
        const pushedLocalIds = pendingRecords.map((record) => record.localId);

        try {
            await db.transaction(async (tx) => {
                await tx
                    .update(schemaTable)
                    .set({ syncStatus: "synced" } as any)
                    .where(inArray(schemaTable.localId, pushedLocalIds));
            });
        } catch (localError) {
            console.error(`Local update failed for ${tableName}:`, localError);
            throw localError;
        }
    } else {
        console.error(`Error pushing ${tableName}:`, error.message);
        throw new Error(`Error pushing ${tableName}: ${error.message}`);
    }
}

export async function pullChanges<T extends AnySQLiteTable>(tableName: string, schemaTable: T & { syncStatus: any; localId: any; updatedAt: any }) {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return;

    const db = getDb();
    const metadata = await db.select().from(syncMetadata).where(eq(syncMetadata.tableName, tableName));

    const lastSyncTs = metadata[0]?.lastSyncedAt ?? 0;
    const lastSyncDate = new Date(lastSyncTs).toISOString();

    const { data: cloudData, error } = await supabase.from(tableName).select("*").gt("updated_at", lastSyncDate).order("updated_at", { ascending: true });

    if (error) {
        throw new Error(`Pull failed for ${tableName}: ${error.message}`);
    }

    if (cloudData && cloudData.length > 0) {
        let latestProcessedTs = lastSyncTs;
        try {
            await db.transaction(async (tx) => {
                for (const data of cloudData) {
                    const localItem = mapToCamelCase(data, tableName);

                    const [existingLocal] = await tx
                        .select({
                            syncStatus: schemaTable.syncStatus,
                            updatedAt: schemaTable.updatedAt,
                        })
                        .from(schemaTable)
                        .where(eq(schemaTable.localId, localItem.localId))
                        .limit(1);

                    if (existingLocal?.syncStatus === "pending") {
                        const localTime = new Date(existingLocal.updatedAt).getTime();
                        const cloudTime = new Date(data.updated_at).getTime();

                        if (localTime >= cloudTime) {
                            console.log(`[Conflict] Keeping local for ${tableName}:${localItem.localId} (Local is newer)`);
                            continue;
                        } else {
                            console.log(`[Conflict] Cloud wins for ${tableName}:${localItem.localId} (Cloud is newer)`);
                        }
                    }

                    if (tableName === "workout_plans") localItem.workoutDaysPerWeek = data.days_per_week;

                    if (localItem.date && typeof localItem.date === "string") {
                        localItem.date = localItem.date.split("T")[0];
                    }

                    localItem.syncStatus = "synced";

                    const { localId, ...updateFields } = localItem;
                    await tx
                        .insert(schemaTable)
                        .values(localItem as any)
                        .onConflictDoUpdate({ target: schemaTable.localId, set: updateFields as any });

                    const recordTs = new Date(data.updated_at).getTime();
                    if (recordTs > latestProcessedTs) {
                        latestProcessedTs = recordTs;
                    }
                }
            });

            await db
                .insert(syncMetadata)
                .values({ tableName, lastSyncedAt: latestProcessedTs })
                .onConflictDoUpdate({ target: syncMetadata.tableName, set: { lastSyncedAt: latestProcessedTs } });
        } catch (dbError) {
            console.error(`Database Pull Error for ${tableName}:`, dbError);
            throw dbError;
        }
    }
}
