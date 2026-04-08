import { useAppData } from "./use-app-data";

import { getDateKey } from "@/lib/helper-functions";

export function useWorkoutLogs() {
    const { logs: workoutLogs, sessions } = useAppData({ includeWorkoutHistory: true });

    const todaysSession = sessions.find((session) => session.date === getDateKey());

    const todaysLogs = workoutLogs.filter((log) => log.sessionId === todaysSession?.localId);

    return { workoutLogs, todaysLogs };
}
