export interface DummyExercise {
    id: number;
    workoutDayId: number;
    name: string;
    sets: number | null;
    reps: number | null;
    type: ExerciseType;
    variant: ExerciseVariant;
    unit: Unit;
    weight: number | null;
    distance: number | null;
    duration: number | null;
}
