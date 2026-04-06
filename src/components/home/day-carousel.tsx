import { cn } from "@/lib/utils";
import { weekdays } from "@/constants/data";
import { Div, P } from "@/components/ui/display";
import { Button } from "@/components/ui/interactive";
import { FlatList } from "react-native-gesture-handler";
import { WorkoutPlanWithDays } from "@/store/use-static-store";

interface CarouselProp {
    selectedDayName: Weekday;
    plan: WorkoutPlanWithDays;
    onSelect: (day: Weekday) => void;
}

export default function DayCarousel({ selectedDayName, plan, onSelect }: CarouselProp) {
    return (
        <Div className="gap-2">
            <P className="text-muted-foreground px-1 text-xs tracking-widest uppercase">Weekly Overview</P>
            <FlatList
                horizontal
                data={weekdays}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-4 pr-8"
                renderItem={({ item: day }) => (
                    <Button component className={cn("h-auto w-32 flex-col gap-1 px-4 py-3", selectedDayName === day ? "bg-accent" : "bg-muted")} onPress={() => onSelect(day)} key={day}>
                        <P className={cn(selectedDayName === day ? "text-white" : "text-foreground")}>{day}</P>
                        {plan.days.some((pDay) => pDay.dayName === day) && <Div className={`size-1.5 rounded-full ${selectedDayName === day ? "bg-white" : "bg-primary"}`} />}
                    </Button>
                )}
            />
        </Div>
    );
}
