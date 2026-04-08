import { useAppData } from "./use-app-data";

import { usePlanStore } from "@/store/use-plan-store";

export function usePlan() {
    const { enrichedPlans } = useAppData({ includePlanDetails: true, includeWorkoutHistory: true });
    const selectedPlanId = usePlanStore((state) => state.selectedPlanId);

    const activePlan = enrichedPlans.find((plan) => plan.localId === selectedPlanId) ?? enrichedPlans[0] ?? null;

    return { enrichedPlans, activePlan };
}
