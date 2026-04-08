import { useAppData } from "./use-app-data";

import { getDateKey } from "@/lib/helper-functions";
import { SessionWithRelations } from "@/types/model";

export function useWorkoutSession() {
    const { sessionsWithLogs } = useAppData({ includePlanDetails: true, includeWorkoutHistory: true });

    const todaysSession = sessionsWithLogs.find((session) => session.date === getDateKey());

    return { sessions: sessionsWithLogs as SessionWithRelations[], todaysSession };
}
