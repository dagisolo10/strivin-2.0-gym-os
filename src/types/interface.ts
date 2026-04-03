export interface Exercise {
    name: string;
    workoutDays: Weekday[];
    unit: Unit;

    sets?: number;
    reps?: number;
    weight?: number;

    distance?: number;
    duration?: number;

    type: ExerciseType;
    variant: ExerciseVariant;
}

export interface User {
    id: string;
    name: string;
    createdAt: Date;
}

export interface WorkoutDay {
    id: string;
    dayName: string;
    exercises: Exercise[];
}

export interface WorkoutPlan {
    id: string;
    workoutDaysPerWeek: number;
    split: WorkoutSplit;
    workoutDays: WorkoutDay[];
    goal?: Goal;
    createdAt: Date;
}

export interface ExerciseLog {
    id: string;
    exerciseId: string;
    date: Date;
    reps: number[];
    weight?: number[];
    completed: boolean;
}

export interface WorkoutSession {
    id: string;
    date: Date;
    exercises: ExerciseLog[];
    perfectDay: boolean;
}
