import { create } from "zustand";

interface PlanState {
    selectedPlanId: number | null;
    setSelectedPlanId: (planId: number) => void;
    syncSelectedPlan: (planIds: number[]) => void;
    clearSelectedPlan: () => void;
}

export const usePlanStore = create<PlanState>((set) => ({
    selectedPlanId: null,
    setSelectedPlanId: (planId) => set({ selectedPlanId: planId }),
    syncSelectedPlan: (planIds) =>
        set((state) => {
            if (!planIds.length) return { selectedPlanId: null };
            if (state.selectedPlanId !== null && planIds.includes(state.selectedPlanId)) return state;
            return { selectedPlanId: planIds[0] };
        }),
    clearSelectedPlan: () => set({ selectedPlanId: null }),
}));
