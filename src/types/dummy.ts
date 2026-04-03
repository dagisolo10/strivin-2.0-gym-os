export interface DummyExercise {
    id: number;
    workoutDayId: number;
    name: string;
    sets: number;
    reps: number;
    type: string;
    variant: string;
    unit: string;
    weight: number | null;
    distance: number | null;
    duration: number | null;
}
