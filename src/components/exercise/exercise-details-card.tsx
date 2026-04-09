import { Button } from "../ui/interactive";
import EditExercise from "./edit-exercise";
import { Badge, Card, Div, P, Row } from "../ui/display";

import { Alert } from "react-native";
import { ReactNode, useState } from "react";
import { toast } from "react-native-sonner";
import type { GroupedExercise } from "@/types/types";
import { deleteExerciseGroup } from "@/server/exercise";
import { ChevronDown, ChevronUp, Clock3, Dumbbell, MapPinned, Pencil, Trash2 } from "lucide-react-native";

interface ExerciseDetailsCardProps {
    groupedExercise: GroupedExercise;
    availableDays: Weekday[];
    userId: string;
    planId: string;
    isExpanded?: boolean;
    onToggle?: (expanded: boolean) => void;
    onExerciseUpdated?: () => void;
    onExerciseDeleted?: () => void;
}

export default function ExerciseDetailsCard({
    groupedExercise,
    availableDays,
    userId,
    planId,
    isExpanded: isExpandedProp,
    onToggle,
    onExerciseUpdated,
    onExerciseDeleted,
}: ExerciseDetailsCardProps) {
    const [isExpandedInternal, setIsExpandedInternal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isExpanded = isExpandedProp ?? isExpandedInternal;

    const handleToggle = () => {
        const nextValue = !isExpanded;
        if (onToggle) {
            onToggle(nextValue);
        } else {
            setIsExpandedInternal(nextValue);
        }
    };

    const { exercise, exerciseIds, workoutDays } = groupedExercise;
    const isCardio = exercise.type === "Cardio";
    const usesWeight = exercise.type !== "Core" || Boolean(exercise.weight);

    const handleDelete = () => {
        Alert.alert("Delete Exercise", `Delete ${exercise.name} from ${workoutDays.length} day${workoutDays.length === 1 ? "" : "s"} in this plan?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    if (isDeleting) return;
                    setIsDeleting(true);

                    try {
                        const result = await deleteExerciseGroup({ exerciseIds, userId });

                        if (result.success) {
                            toast.success("Exercise deleted successfully");
                            onExerciseDeleted?.();
                        } else {
                            toast.error(result.error || "Failed to delete exercise");
                        }
                    } catch {
                        toast.error("An unexpected error occurred while deleting the exercise");
                    } finally {
                        setIsDeleting(false);
                    }
                },
            },
        ]);
    };

    const handleEditSuccess = () => {
        setIsEditing(false);
        onExerciseUpdated?.();
    };

    const summary = isCardio
        ? `${exercise.distance ?? 0}${exercise.unit ?? "km"} - ${exercise.duration ?? 0} min`
        : `${exercise.sets ?? 0} sets${exercise.reps ? `  •  ${exercise.reps} reps` : ""}${usesWeight && exercise.weight ? `  •  ${exercise.weight}${exercise.unit ?? "kg"}` : ""}`;

    if (isEditing) {
        return (
            <EditExercise
                exercise={exercise}
                exerciseIds={exerciseIds}
                workoutDays={workoutDays}
                availableDays={availableDays}
                userId={userId}
                planId={planId}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditing(false)}
            />
        );
    }

    return (
        <Card className="p-0">
            <Button variant="ghost" onPress={handleToggle} className="h-auto p-4" component>
                <Row className="flex-1 gap-4">
                    <Div className="bg-muted size-12 items-center justify-center rounded-2xl">
                        <P className="text-primary text-sm font-bold">{exercise.type.slice(0, 4)}</P>
                    </Div>

                    <Row className="flex-1 items-start gap-2">
                        <Div className="flex-1">
                            <Row>
                                <P className="text-lg font-bold">{exercise.name}</P>
                            </Row>
                            <P className="text-muted-foreground text-sm">{summary}</P>
                        </Div>
                    </Row>

                    <P className="text-muted-foreground text-sm">
                        ({exercise.type} - {exercise.variant})
                    </P>

                    {isExpanded ? <ChevronUp size={18} color="#666" /> : <ChevronDown size={18} color="#666" />}
                </Row>
            </Button>

            {isExpanded && (
                <Div className="gap-4 p-4">
                    <Div className="gap-2">
                        <Row>
                            <P className="text-muted-foreground text-sm">Scheduled days</P>
                            <Row className="flex-wrap justify-start gap-2">
                                <Badge variant={isCardio ? "secondary" : "outline"}>{isCardio ? "Cardio" : "Strength"}</Badge>
                                <Badge variant="muted">
                                    {workoutDays.length} day{workoutDays.length === 1 ? "" : "s"}
                                </Badge>
                            </Row>
                        </Row>
                        <Row className="flex-wrap justify-start gap-2">
                            {workoutDays.map((day: Weekday) => (
                                <Badge key={day} variant="secondary">
                                    {day}
                                </Badge>
                            ))}
                        </Row>
                    </Div>

                    <Row className="items-start gap-3">
                        <StatCard label="Type" value={exercise.type} />
                        <StatCard label="Variant" value={exercise.variant} />
                    </Row>

                    {isCardio ? (
                        <Row className="items-start gap-3">
                            <StatCard
                                label="Distance"
                                value={`${exercise.distance ?? 0} ${exercise.unit ?? "km"}`}
                                icon={<MapPinned size={16} color="#666" />}
                            />
                            <StatCard label="Duration" value={`${exercise.duration ?? 0} min`} icon={<Clock3 size={16} color="#666" />} />
                        </Row>
                    ) : (
                        <Row className="items-start gap-3">
                            <StatCard label="Sets" value={`${exercise.sets ?? 0}`} />
                            <StatCard label="Reps" value={`${exercise.reps ?? 0}`} />
                            <StatCard
                                label={usesWeight ? "Weight" : "Load"}
                                value={usesWeight ? `${exercise.weight ?? 0} ${exercise.unit ?? "kg"}` : "Bodyweight"}
                                icon={usesWeight ? <Dumbbell size={16} color="#666" /> : undefined}
                            />
                        </Row>
                    )}

                    <Row className="gap-3">
                        <Button variant="outline" onPress={() => setIsEditing(true)} className="flex-1" component>
                            <Row className="justify-center gap-2">
                                <Pencil size={16} color="#111" />
                                <P className="text-sm font-semibold">Edit</P>
                            </Row>
                        </Button>
                        <Button variant="destructive" onPress={handleDelete} className="flex-1" disabled={isDeleting} component>
                            <Row className="justify-center gap-2">
                                <Trash2 size={16} color="#fff" />
                                <P className="text-sm font-semibold text-white">{isDeleting ? "Deleting..." : "Delete"}</P>
                            </Row>
                        </Button>
                    </Row>
                </Div>
            )}
        </Card>
    );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
    return (
        <Div className="bg-muted/45 flex-1 rounded-[20px] px-4 py-3">
            <Row className="justify-start gap-2">
                {icon}
                <P className="text-muted-foreground text-xs uppercase">{label}</P>
            </Row>
            <P className="mt-2 text-sm">{value}</P>
        </Div>
    );
}
