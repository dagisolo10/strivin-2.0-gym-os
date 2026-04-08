import { useAppData } from "./use-app-data";

export function useExercise() {
    const { exercises } = useAppData({ includePlanDetails: true });

    return { exercises };
}
