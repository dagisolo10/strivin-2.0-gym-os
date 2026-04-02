//  const completed = reps.length === exercise.set

//  if each exercise's rep and set is full filled.
//  Ex: Exercise Bench Press has 2 sets of 12 reps,
//  exerciseLog.completed and each number must match the count number

// const isPerfectDay = session.exercises.every((log) => {
//     const originalExercise = workoutPlan.days.flatMap((day) => day.exercises).find((ex) => ex.id === log.exerciseId);

//     if (!originalExercise) return false;

//     const allRepsHit = log.reps.every((rep) => rep >= (originalExercise.startingReps || 0));

//     const allSetsDone = log.completed;

//     return allRepsHit && allSetsDone;
// });

export interface Streak {
    current: number;
    longest: number;
    lastPerfectDate: Date;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    earnedDate: Date;
}

export interface Notification {
    id: string;
    message: string;
    date: Date;
    read: boolean;
}

export interface WorkoutNotification {
    id: string;
    workoutDay: string;
    workoutTime: string;
    reminderOffset?: number;
    type: "preWorkout" | "postWorkout";
    sent: boolean;
}
