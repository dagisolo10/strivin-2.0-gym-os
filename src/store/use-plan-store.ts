import { create } from "zustand";

interface PlanState {
    selectedPlanId: string | null;
    setSelectedPlanId: (planId: string) => void;
    syncSelectedPlan: (planIds: string[]) => void;
    clearSelectedPlan: () => void;
}

export const usePlanStore = create<PlanState>((set) => ({
    selectedPlanId: null,

    setSelectedPlanId: (planId) => set({ selectedPlanId: planId }),

    syncSelectedPlan: (planIds) =>
        set((state) => {
            if (!planIds.length) return { selectedPlanId: null };

            const stillValid = state.selectedPlanId && planIds.includes(state.selectedPlanId);
            if (stillValid) return state;

            return { selectedPlanId: planIds[0] };
        }),

    clearSelectedPlan: () => set({ selectedPlanId: null }),
}));
