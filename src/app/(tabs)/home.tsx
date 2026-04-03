import { cn } from "@/lib/utils";
import { useState } from "react";
import { user } from "@/mock/user";
import { Image } from "react-native";
import { weekdays } from "@/constants/data";
import { DummyExercise } from "@/types/dummy";
import { Button, Input } from "@/components/ui/button";
import { FlatList } from "react-native-gesture-handler";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Badge, Card, Div, H1, H2, H3, Label, P, Row, Screen, Separator } from "@/components/ui/view";

export default function HomeScreen() {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }) as Weekday;
    const [exerciseDay, setExerciseDay] = useState<Weekday>(today);

    const exercises = (user.plans[0].days.find((day) => day.dayName === exerciseDay)?.exercises || []) as DummyExercise[];

    const [expandedExerciseId, setExpandedExerciseId] = useState<number | null>(null);

    return (
        <Screen className="px-6 pt-8" scrollable={false}>
            <FlatList<DummyExercise>
                data={exercises}
                ListHeaderComponent={() => (
                    <Div className="gap-6">
                        <Row>
                            <Div>
                                <P className="text-muted-foreground">Welcome back,</P>
                                <H2>{user.name}</H2>
                            </Div>
                            <Image className="border-border size-16 rounded-full border" source={user.profile ? { uri: user.profile } : require("../../../assets/icons/home.png")} />
                        </Row>

                        <Div className="bg-accent rounded-tr-3xl rounded-bl-3xl p-6">
                            <Div className="flex-row items-start justify-between">
                                <Div>
                                    <P className="font-medium text-white/80">Weekly Streak</P>
                                    <H1 className="mt-1 text-4xl font-bold text-white">5 Days</H1>
                                </Div>

                                <Badge variant={"glass"}>Pro</Badge>
                            </Div>

                            <Div className="mt-6 flex-row items-center gap-2">
                                <Div className="h-2 flex-1 overflow-hidden rounded-full bg-white/30">
                                    <Div className="h-full w-[70%] bg-white" />
                                </Div>
                                <P className="text-xs font-bold text-white">70%</P>
                            </Div>
                        </Div>

                        <Div className="gap-2">
                            <Row>
                                <H3 className="font-bold">Your Split</H3>
                                <P className="text-primary font-bold">View Plan</P>
                            </Row>
                            <FlatList
                                horizontal
                                data={weekdays}
                                keyExtractor={(item) => item}
                                showsHorizontalScrollIndicator={false}
                                ItemSeparatorComponent={Separator}
                                renderItem={({ item: day }) => (
                                    <Button className={cn("h-auto w-32 rounded-2xl p-4", exerciseDay === day ? "bg-accent" : "bg-muted")} textClassName={cn("font-bold", exerciseDay === day ? "text-white" : "text-foreground")} onPress={() => setExerciseDay(day)} key={day}>
                                        {day}
                                    </Button>
                                )}
                            />
                        </Div>

                        <Row className="mb-2">
                            <H3 className="font-bold">Today&apos;s Routine</H3>
                            <P className="text-muted-foreground font-bold">{exerciseDay}</P>
                        </Row>
                    </Div>
                )}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerClassName="pb-32"
                ItemSeparatorComponent={() => <Separator vertical size={12} />}
                renderItem={({ item: exercise }) => <ExerciseCard exercise={exercise} expandedId={expandedExerciseId} onPress={() => setExpandedExerciseId((currentId) => (currentId === exercise.id ? null : exercise.id))} />}
            />
        </Screen>
    );
}

function ExerciseCard({ exercise, onPress, expandedId }: { exercise: DummyExercise; onPress: () => void; expandedId: number | null }) {
    const isExpanded = expandedId === exercise.id;

    const [weight, setWeight] = useState(exercise.weight?.toString() || "");
    const [reps, setReps] = useState(exercise.reps?.toString() || "");
    const [currentSet, setCurrentSet] = useState(0);
    const completed = currentSet >= exercise.sets;

    return (
        <Card className={cn("gap-0 rounded-2xl p-0", isExpanded && "border-primary/30 shadow-md")}>
            <Button variant="ghost" className="h-auto flex-row items-center justify-between p-4" onPress={onPress} component>
                <Row className="w-full flex-1">
                    <Div className="row gap-4">
                        <Div className="bg-muted size-12 items-center justify-center rounded-xl">
                            <P className="text-primary font-bold">{exercise.type}</P>
                        </Div>

                        <Div>
                            <P className="text-lg font-bold">{exercise.name}</P>
                            <P className="text-muted-foreground text-sm">
                                {exercise.sets} Sets × {exercise.reps} Reps
                            </P>
                        </Div>
                    </Div>

                    {expandedId && expandedId === exercise.id ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
                </Row>
            </Button>

            {isExpanded && (
                <Div className="bg-muted/10 gap-6 px-4 pb-4">
                    <Div className="row items-end justify-between">
                        <Div>
                            <P className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">Current Set</P>
                            <H3 className="text-2xl">
                                {completed ? exercise.sets : currentSet} <P className="text-muted-foreground text-sm">of {exercise.sets}</P>
                            </H3>
                        </Div>

                        <Row className="gap-3">
                            <Div className="items-center">
                                <Label className="text-xs font-bold">Weight ({exercise.unit})</Label>
                                <Input className="text-primary text-lg font-bold" keyboardType="numeric" value={weight} onChangeText={setWeight} placeholderTextColor="#999" />
                            </Div>

                            <Div className="items-center">
                                <Label className="text-xs font-bold">Reps Done</Label>
                                <Input className="text-primary text-lg font-bold" keyboardType="numeric" value={reps} onChangeText={setReps} placeholderTextColor="#999" />
                            </Div>
                        </Row>
                    </Div>

                    <Button variant={completed ? "success" : "primary"} textClassName="text-background" onPress={() => currentSet < exercise.sets && setCurrentSet((prev) => prev + 1)}>
                        {completed ? "Exercise Finished" : `Log Set ${currentSet + 1}`}
                    </Button>
                </Div>
            )}
        </Card>
    );
}
