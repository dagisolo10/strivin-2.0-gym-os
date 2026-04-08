import { ReactNode, useContext, createContext } from "react";

const DrizzleContext = createContext<DB | null>(null);

interface DrizzleProviderProps {
    children: ReactNode;
    db: DB;
}

export const DrizzleProvider = ({ children, db }: DrizzleProviderProps) => <DrizzleContext.Provider value={db}>{children}</DrizzleContext.Provider>;

export const useDrizzle = () => {
    const context = useContext(DrizzleContext);
    if (!context) throw new Error("useDrizzle must be used within DrizzleProvider");
    return context;
};
