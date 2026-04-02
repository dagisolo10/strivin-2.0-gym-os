import * as schema from "@/db/sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { NavLink } from "@/components/ui/button";
import { H1, P, Screen } from "@/components/ui/view";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";

export default function Profile() {
    const db = useSQLiteContext();
    const drizzleDB = drizzle(db, { schema });

    const user = useLiveQuery(drizzleDB.query.users.findFirst());

    return (
        <Screen className="items-center justify-center p-4">
            <H1>Profile</H1>

            <P>User: {user.data?.name}</P>

            <NavLink href="/" textClassName="text-4xl mt-8">
                Home
            </NavLink>

            <NavLink href="/settings" textClassName="text-4xl mt-8">
                Settings
            </NavLink>
        </Screen>
    );
}
