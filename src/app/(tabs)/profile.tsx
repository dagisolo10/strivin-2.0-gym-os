import { useMemo } from "react";
import * as schema from "@/db/sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { NavLink } from "@/components/ui/button";
import { ActivityIndicator, Image } from "react-native";
import { Div, H1, P, Screen } from "@/components/ui/view";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";

export default function Profile() {
    const db = useSQLiteContext();
    const drizzleDB = useMemo(() => drizzle(db, { schema }), [db]);

    const user = useLiveQuery(drizzleDB.query.users.findFirst({ with: { plans: { with: { days: { with: { exercises: true } } } } } }));

    if (!user) return <ActivityIndicator size={"large"} />;

    return (
        <Screen className="items-center justify-center p-4">
            <H1>Profile</H1>

            <P>User: {user.data?.name}</P>

            <P>Split: {user.data?.plans[0].split}</P>
            <P>Goal: {user.data?.plans[0].goal}</P>

            <Image className="size-24 rounded-full" source={user.data?.profile ? { uri: user.data.profile } : require("../../../assets/icons/home.png")} />

            {user.data?.plans[0].days.map((day) => (
                <Div key={day.id}>
                    <P>{day.dayName}</P>
                    {day.exercises.map((exercise) => (
                        <Div className="gap-2" key={exercise.id}>
                            <H1>{exercise.name}</H1>
                            <P>Distance: {exercise.distance}</P>
                            <P>duration: {exercise.duration}</P>
                            <P>reps: {exercise.reps}</P>
                            <P>sets: {exercise.sets}</P>
                            <P>type: {exercise.type}</P>
                            <P>unit: {exercise.unit}</P>
                            <P>variant: {exercise.variant}</P>
                            <P>weight: {exercise.weight}</P>
                        </Div>
                    ))}
                </Div>
            ))}

            <NavLink href="/" textClassName="text-4xl mt-8">
                Home
            </NavLink>

            <NavLink href="/settings" textClassName="text-4xl mt-8">
                Settings
            </NavLink>
        </Screen>
    );
}
