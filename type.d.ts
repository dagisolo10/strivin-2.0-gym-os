import { weekdays } from "@/constants/data";
import type { ImageSourcePropType } from "react-native";

declare global {
    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    type Weekday = (typeof weekdays)[number];

    type Unit = "kg" | "lb" | "km" | "mi";
    type ExerciseVariant = "Upper" | "Lower" | "Endurance";
    type ExerciseType = "Push" | "Pull" | "Legs" | "Core" | "Cardio";
    type Goal = "Hypertrophy" | "Strength" | "Endurance" | "Fat Loss";
    type WorkoutSplit = "Push Pull Leg" | "Upper Lower" | "Full Body" | "Endurance";
}
