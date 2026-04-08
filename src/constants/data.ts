export const STEP_CONTENT = {
    0: { title: "Welcome to Strivin", subtitle: "The ultimate OS for your fitness journey. Let's get you set up." },
    1: { title: "The Basics.", subtitle: "How should we address you?" },
    2: { title: "Frequency & Focus.", subtitle: "How many days a week are you hitting the gym, and what's the split? (e.g., PPL, Upper/Lower)" },
    3: { title: "Build Your Routine.", subtitle: "Define your exercises, sets, and starting weights for each day." },
    4: { title: "Refine Your Goals.", subtitle: "What's your target? (Strength, Hypertrophy, or Endurance) and preferred session length." },
    5: { title: "Identity.", subtitle: "Add a profile picture (Optional)." },
    6: { title: "You're All Set.", subtitle: "Your personalized plan is ready. Let's get to work!" },
};

export const TOTAL_STEPS = 6;

export const weekdays = ["Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export const DAY_ORDER: Record<Weekday, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

export const DISTANCE_UNITS: Extract<Unit, "km" | "mi">[] = ["km", "mi"];
export const WEIGHT_UNITS: Extract<Unit, "kg" | "lb">[] = ["kg", "lb"];

export const TYPES = ["Push", "Pull", "Legs", "Core", "Cardio"] as const satisfies readonly ExerciseType[];
export const VARIANTS = ["Upper", "Lower", "Endurance", "Full Body"] as const satisfies readonly ExerciseVariant[];
export const WORKOUT_SPLIT = ["Push Pull Leg", "Upper Lower", "Full Body", "Endurance"] as const satisfies readonly WorkoutSplit[];

export const GOALS: { label: Goal; icon: string; note: string }[] = [
    { label: "Hypertrophy", icon: "flash-outline", note: "Build size with steady progressive overload." },
    { label: "Strength", icon: "barbell-outline", note: "Bias heavier work and lower rep targets." },
    { label: "Endurance", icon: "heart-outline", note: "Improve stamina and work capacity." },
    { label: "Fat Loss", icon: "walk-outline", note: "Stay consistent with training volume & cardio." },
];

export const FITNESS_LEVELS: FitnessLevel[] = ["Beginner", "Intermediate", "Advanced"];

export const SESSION_LENGTHS = [30, 45, 60, 90];
