import { getDb } from "./client";
import { syncMetadata } from "./sqlite";

import { eq, inArray } from "drizzle-orm";
import { supabase } from "@/lib/supabase";
import { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import { mapToSnakeCase, mapToCamelCase } from "@/lib/helper-functions";

export async function pushChanges<T extends AnySQLiteTable>(tableName: string, schemaTable: T & { syncStatus: any; localId: any }) {
    const db = getDb();
    const pendingRecords = await db.select().from(schemaTable).where(eq(schemaTable.syncStatus, "pending"));

    if (pendingRecords.length === 0) return;

    const recordToPush = pendingRecords.map((record) => {
        const data = mapToSnakeCase(record);

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
        }
    } else {
        console.error(`Error pushing ${tableName}:`, error.message);
    }
}

export async function pullChanges<T extends AnySQLiteTable>(tableName: string, schemaTable: T & { syncStatus: any; localId: any }) {
    const db = getDb();
    const metadata = await db.select().from(syncMetadata).where(eq(syncMetadata.tableName, tableName));

    const lastSyncTs = metadata[0]?.lastSyncedAt ?? 0;
    const lastSyncDate = new Date(lastSyncTs).toISOString();

    const { data: cloudData, error } = await supabase.from(tableName).select("*").gt("updated_at", lastSyncDate).order("updated_at", { ascending: true });

    if (error) {
        console.error(`Error pulling ${tableName}:`, error.message);
        return;
    }

    if (cloudData && cloudData.length > 0) {
        let latestProcessedTs = lastSyncTs;
        try {
            await db.transaction(async (tx) => {
                for (const item of cloudData) {
                    const localItem = mapToCamelCase(item);

                    if (tableName === "workout_plans") localItem.workoutDaysPerWeek = item.days_per_week;

                    localItem.syncStatus = "synced";

                    const { localId, ...updateFields } = localItem;
                    await tx
                        .insert(schemaTable)
                        .values(localItem as any)
                        .onConflictDoUpdate({ target: schemaTable.localId, set: updateFields as any });

                    const recordTs = new Date(item.updated_at).getTime();
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
        }
    }
}
