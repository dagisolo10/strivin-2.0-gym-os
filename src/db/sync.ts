import { getDb } from "./client";
import { syncMetadata } from "./sqlite";

import { eq } from "drizzle-orm";
import { supabase } from "@/lib/supabase";
import { mapToSnakeCase, mapToCamelCase } from "@/lib/helper-functions";

export async function pushChanges(tableName: string, schemaTable: any) {
    const db = getDb();
    const pendingRecords = await db.select().from(schemaTable).where(eq(schemaTable.syncStatus, "pending"));

    for (const record of pendingRecords) {
        const dataToPush = mapToSnakeCase(record);

        if (tableName === "workout_plans" && dataToPush.workout_days_per_week) {
            dataToPush.days_per_week = dataToPush.workout_days_per_week;
            delete dataToPush.workout_days_per_week;
        }

        dataToPush.sync_status = "synced";

        const { error } = await supabase.from(tableName).upsert(dataToPush);

        if (!error) {
            await db.update(schemaTable).set({ syncStatus: "synced" }).where(eq(schemaTable.localId, record.localId));
        } else {
            console.error(`Error pushing ${tableName}:`, error.message);
        }
    }
}

export async function pullChanges(tableName: string, schemaTable: any) {
    const db = getDb();
    const metadata = await db.select().from(syncMetadata).where(eq(syncMetadata.tableName, tableName));
    const lastSyncDate = metadata[0]?.lastSyncedAt ? new Date(metadata[0].lastSyncedAt).toISOString() : new Date(0).toISOString();

    const { data: cloudData, error } = await supabase.from(tableName).select("*").gt("updated_at", lastSyncDate);

    if (error) {
        console.error(`Error pulling ${tableName}:`, error.message);
        return;
    }

    if (cloudData && cloudData.length > 0) {
        for (const item of cloudData) {
            try {
                const localItem = mapToCamelCase(item);

                if (tableName === "workout_plans") {
                    localItem.workoutDaysPerWeek = item.days_per_week;
                }

                localItem.syncStatus = "synced";

                await db.insert(schemaTable).values(localItem).onConflictDoUpdate({ target: schemaTable.localId, set: localItem });
            } catch (dbError) {
                console.error(`Database Insert Error for ${tableName}:`, dbError);
            }
        }

        await db
            .insert(syncMetadata)
            .values({ tableName, lastSyncedAt: Date.now() })
            .onConflictDoUpdate({ target: syncMetadata.tableName, set: { lastSyncedAt: Date.now() } });
    }
}
