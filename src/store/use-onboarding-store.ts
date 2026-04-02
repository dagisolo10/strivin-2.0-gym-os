import { create } from "zustand";
import { Exercise, Goal, WorkoutSplit } from "@/types/interface";

interface OnboardingState {
    name: string;
    split: WorkoutSplit;
    workoutDays: string[];
    exercises: Exercise[];
    goal: Goal;
    profile: string | null;

    updateField: (field: string, value: any) => void;
    reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
    name: "",
    split: "Push Pull Leg",
    workoutDays: ["Monday", "Wednesday", "Friday"],
    exercises: [],
    goal: "Hypertrophy",
    profile: null,

    updateField: (field, value) => set((state) => ({ ...state, [field]: value })),
    reset: () => set({ name: "", split: "Push Pull Leg", goal: "Hypertrophy", exercises: [] }),
}));
