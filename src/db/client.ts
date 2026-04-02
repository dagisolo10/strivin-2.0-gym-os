import * as schema from "./postgres";

import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

const expoDb = openDatabaseSync("gym.db");
export const db = drizzle(expoDb, { schema });
