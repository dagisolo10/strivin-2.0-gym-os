import * as schema from "./schema";

import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

const expoDb = openDatabaseSync("db.db");
export const db = drizzle(expoDb, { schema });
