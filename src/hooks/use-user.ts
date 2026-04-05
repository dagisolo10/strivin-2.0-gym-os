import { useMemo } from "react";
import { useStaticStore } from "@/store/use-static-store";

export function useUser() {
    const { getUserWithRelations, currentUserId } = useStaticStore();

    const user = useMemo(() => {
        if (!currentUserId) return null;
        return getUserWithRelations(currentUserId);
    }, [currentUserId, getUserWithRelations]);

    const dataHash = useMemo(() => {
        if (!user) return "0-0";
        return `${Date.now()}-${user.sessions?.length ?? 0}`;
    }, [user]);

    return { user, isLoading: !user, dataHash, updatedAt: Date.now() };
}
