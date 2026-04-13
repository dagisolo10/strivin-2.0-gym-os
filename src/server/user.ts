import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/sqlite";
import { enqueueWrite } from "@/db/high-order-fn";

interface UpdateUserData {
    name?: string;
    profile?: string;
}

export async function updateUser(userId: string, data: UpdateUserData) {
    if (!userId) throw new Error("updateUser requires a valid userId");

    const db = getDb();

    return enqueueWrite(() =>
        db
            .update(users)
            .set({ ...data, updatedAt: new Date().toISOString(), syncStatus: "pending" })
            .where(eq(users.localId, userId))
            .returning(),
    );
}
