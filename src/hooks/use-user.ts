import { useAppData } from "./use-app-data";
import { UserWithPlanOnly } from "@/types/types";

export function useUser() {
    const { user, plans, updatedAt, isLoading } = useAppData();
    const userWithRelations: UserWithPlanOnly | null = user ? { ...user, plans, sessions: [] } : null;

    return {
        user: userWithRelations,
        isLoading,
        updatedAt,
    };
}
