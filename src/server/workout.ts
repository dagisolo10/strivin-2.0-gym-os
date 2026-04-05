import { getDateKey } from "@/lib/helper-functions";
import { useStaticStore } from "@/store/use-static-store";

export function calculateSuggestedLoad(targetWeight?: number | null, averageWeight?: number | null, averageReps?: number | null, targetReps?: number | null) {
    if (!targetWeight || !targetReps || !averageReps) return null;
    if (averageReps >= targetReps) return Math.round(targetWeight * 1.03);
    if (averageReps < targetReps * 0.7) return Math.max(1, Math.round(targetWeight * 0.97));
    return Math.round(targetWeight);
}

export function calculateStreak(sessions: { date: string; perfectDay: boolean | null }[]) {
    const perfectSessions = [...sessions].filter((session) => session.perfectDay).sort((a, b) => (a.date < b.date ? 1 : -1));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let previousDate: Date | null = null;
    let streakBroken = false;

    const todayKey = getDateKey();
    const latestSession = perfectSessions[0];
    const latestDateKey = latestSession?.date ? getDateKey(new Date(latestSession.date)) : null;

    for (const session of perfectSessions) {
        const currentDate = new Date(session.date);

        if (!previousDate) {
            tempStreak = 1;
        } else {
            const diffInDays = Math.round((previousDate.getTime() - currentDate.getTime()) / 86_400_000);
            if (diffInDays <= 1) {
                tempStreak += 1;
            } else {
                streakBroken = true;
                tempStreak = 1;
            }
        }

        if (!streakBroken && latestDateKey === todayKey) {
            currentStreak = tempStreak;
        }

        if (tempStreak > longestStreak) longestStreak = tempStreak;
        previousDate = currentDate;
    }

    return {
        current: currentStreak,
        longest: longestStreak,
        lastPerfectDate: latestSession?.date ?? null,
    };
}

export async function logExerciseSet(data: { userId: number; exerciseId: number; reps?: number; weight?: number; duration?: number; distance?: number }) {
    const dateKey = getDateKey();
    const { userId, exerciseId, reps, weight, duration, distance } = data;

    try {
        const store = useStaticStore.getState();

        // Get or create today's session
        let session = store.sessions.find((s) => s.userId === userId && s.date === dateKey);

        if (!session) {
            session = store.createSession({ userId, date: dateKey, sessionLength: null, perfectDay: false });
        }

        // Create the exercise log
        store.createLog({
            userId,
            sessionId: session.id,
            exerciseId,
            reps: reps ?? null,
            weight: weight ?? null,
            duration: duration ?? null,
            distance: distance ?? null,
            completed: true,
            date: dateKey,
        });

        console.log("[logExerciseSet] Transaction completed successfully");
    } catch (error) {
        console.error("[logExerciseSet] Error:", error);

        if (error instanceof Error) {
            throw new Error(`Logging failed: ${error.message}`);
        } else {
            throw new Error("An unexpected error occurred while saving your set.");
        }
    }
}

export async function resetLocalUserData() {
    const store = useStaticStore.getState();
    const localUser = store.users.find((u) => u.id === store.currentUserId);

    if (!localUser) return;

    // Reset the store to initial state
    store.resetToInitial();
}

export async function getRecentLogsForExercise(userId: number, exerciseId: number) {
    const store = useStaticStore.getState();
    return store.getLogsForExercise(exerciseId, 6);
}

export async function getUser() {
    const store = useStaticStore.getState();
    return store.getUserWithRelations(store.currentUserId || 1);
}
