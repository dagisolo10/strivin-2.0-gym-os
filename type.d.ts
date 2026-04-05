import * as schema from "@/db/sqlite";
import { weekdays } from "@/constants/data";
import type { ImageSourcePropType } from "react-native";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";

declare global {
    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    type DB = ExpoSQLiteDatabase<typeof schema>;

    type Weekday = (typeof weekdays)[number];

    type FitnessLevel = "Beginner" | "Intermediate" | "Advanced";
    type ExerciseType = "Push" | "Pull" | "Legs" | "Core" | "Cardio";
    type Goal = "Hypertrophy" | "Strength" | "Endurance" | "Fat Loss";
    type ExerciseVariant = "Upper" | "Lower" | "Endurance" | "Full Body";
    type Unit = "kg" | "lb" | "km" | "mi" | "sec" | "mins" | "meters" | "reps";
    type WorkoutSplit = "Push Pull Leg" | "Upper Lower" | "Full Body" | "Endurance" | (string & {});
}
