import { create } from "zustand";
import { Exercise } from "@/types/model";

interface OnboardingState {
    name: string;
    split: WorkoutSplit;
    workoutDays: Weekday[];
    exercises: Exercise[];
    goal: Goal;
    sessionLength?: number;
    fitnessLevel?: FitnessLevel;
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
    sessionLength: 60,
    fitnessLevel: "Beginner",
    profile: null,

    updateField: (field, value) => set((state) => ({ ...state, [field]: value })),
    reset: () => set({ name: "", split: "Push Pull Leg", workoutDays: ["Monday", "Wednesday", "Friday"], goal: "Hypertrophy", exercises: [], sessionLength: 60, fitnessLevel: "Beginner", profile: null }),
}));
