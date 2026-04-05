import * as schema from "@/db/sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { createContext, ReactNode, useContext, useMemo } from "react";

const DrizzleContext = createContext<DB | null>(null);

export const DrizzleProvider = ({ children }: { children: ReactNode }) => {
    const db = useSQLiteContext();
    const drizzleDB = useMemo(() => drizzle(db, { schema }), [db]);

    return <DrizzleContext.Provider value={drizzleDB}>{children}</DrizzleContext.Provider>;
};

export const useDrizzle = () => {
    const context = useContext(DrizzleContext);
    if (!context) throw new Error("useDrizzle must be used within DrizzleProvider");
    return context;
};
