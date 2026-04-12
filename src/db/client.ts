import * as schema from "./sqlite";

import { drizzle } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase, openDatabaseSync } from "expo-sqlite";

const DATABASE_NAME = "Strivin_v10.db";

let expoDb: ReturnType<typeof openDatabaseSync> | null = null;
let drizzleDb: DB | null = null;

export const initializeDb = (sqliteDb?: SQLiteDatabase | null) => {
    if (sqliteDb) {
        if (!expoDb) expoDb = sqliteDb;
        if (!drizzleDb) drizzleDb = drizzle(expoDb, { schema }) as DB;
        return { expoDb, drizzleDb };
    }

    if (!expoDb) {
        expoDb = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });
    }

    if (!drizzleDb) {
        drizzleDb = drizzle(expoDb, { schema }) as DB;
    }

    return { expoDb, drizzleDb };
};

export const getDb = () => {
    const { drizzleDb: database } = initializeDb();
    return database;
};

export const getExpoDb = () => {
    const { expoDb: database } = initializeDb();
    return database;
};
