import { cn } from "@/lib/utils";
import * as schema from "@/db/sqlite";
import { DAY_ORDER } from "@/constants/data";
import { Button } from "@/components/ui/interactive";
import { FlatList } from "react-native-gesture-handler";
import { Badge, Card, Div, H3, P, Row } from "@/components/ui/display";

type PlanCard = typeof schema.workoutPlans.$inferSelect & {
    days: (typeof schema.workoutDays.$inferSelect & {
        exercises?: (typeof schema.exercises.$inferSelect)[];
    })[];
};

interface PlanCarouselProps {
    title?: string;
    subtitle?: string;
    plans: PlanCard[];
    selectedPlanId: number | null;
    onSelect: (planId: number) => void;
}

export function PlanCarousel({ plans, selectedPlanId, onSelect, title, subtitle }: PlanCarouselProps) {
    if (!plans.length) return null;

    return (
        <Div className="gap-3">
            <Div className="gap-1">
                <H3>{title}</H3>
                <P className="text-muted-foreground text-sm">{subtitle}</P>
            </Div>

            <FlatList
                horizontal
                data={plans}
                keyExtractor={(item) => String(item.id)}
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-3 pr-2"
                renderItem={({ item: plan }) => {
                    const isSelected = plan.id === selectedPlanId;
                    const orderedDays = [...plan.days].sort((a, b) => DAY_ORDER[a.dayName] - DAY_ORDER[b.dayName]);
                    const totalExercises = orderedDays.reduce((sum, day) => sum + (day.exercises?.length ?? 0), 0);

                    return (
                        <Button variant="ghost" className="h-auto p-0" onPress={() => onSelect(plan.id)} component>
                            <Card variant={isSelected ? "primary" : "muted"} className={cn("min-h-72 w-80 gap-4")}>
                                <Row className="items-start gap-3">
                                    <Div className="flex-1">
                                        <Row>
                                            <P className={cn("text-xs uppercase", isSelected ? "text-white/70" : "text-muted-foreground")}>Plan {plan.id}</P>
                                            <Badge variant={isSelected ? "glass" : "outline"}>{orderedDays.length} days</Badge>
                                        </Row>
                                        <H3 className={cn(isSelected ? "text-white" : "text-foreground")}>{plan.split}</H3>
                                        <P className={cn("mt-1 text-sm", isSelected ? "text-white/75" : "text-muted-foreground")}>{plan.goal ?? "General fitness"}</P>
                                    </Div>
                                </Row>

                                <Div className="items-start gap-2">
                                    <Row className="gap-2">
                                        {orderedDays.slice(0, 4).map((day) => (
                                            <Div key={`${plan.id}-${day.id}`} className={cn("min-w-16 flex-1 items-center rounded-full px-4 py-2", isSelected ? "bg-white/12" : "bg-accent")}>
                                                <P className={cn("text-xs text-white")}>{day.dayName.slice(0, 3)}</P>
                                            </Div>
                                        ))}
                                    </Row>
                                    {orderedDays.length > 4 ? (
                                        <Badge className="min-w-16" variant={isSelected ? "glass" : "outline"}>
                                            +{orderedDays.length - 4}
                                        </Badge>
                                    ) : null}
                                </Div>

                                <Row className="mt-auto">
                                    <Div>
                                        <P className={cn("text-xs uppercase", isSelected ? "text-white/70" : "text-muted-foreground")}>Exercises</P>
                                        <P className={cn("mt-1 text-base", isSelected ? "text-white" : "text-foreground")}>{totalExercises} movements</P>
                                    </Div>
                                    <Div className={cn("rounded-2xl p-3", isSelected ? "bg-white/12" : "bg-muted/60")}>
                                        <P className={cn("text-xs uppercase", isSelected ? "text-white/70" : "text-muted-foreground")}>Level</P>
                                        <P className={cn("mt-1 text-sm", isSelected ? "text-white" : "text-foreground")}>{plan.fitnessLevel ?? "Beginner"}</P>
                                    </Div>
                                </Row>
                            </Card>
                        </Button>
                    );
                }}
            />
        </Div>
    );
}
