let writeQueue: Promise<void> = Promise.resolve();

export function enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
    const result = writeQueue.then(operation, operation);
    writeQueue = result.then(
        () => undefined,
        () => undefined,
    );
    return result;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3, baseDelay = 1000): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            const msg = error.message?.toLowerCase() ?? "";
            const isConstraintError =
                msg.includes("constraint") ||
                msg.includes("duplicate key") ||
                msg.includes("unique violation") ||
                msg.includes("violates foreign key") ||
                error.code === "23505" ||
                error.code === "23503" ||
                error.status === 400;
            if (isConstraintError) throw error;

            if (attempt < maxAttempts) {
                const waitTime = baseDelay * Math.pow(2, attempt - 1); // 1s, 2s, 4s
                console.warn(`Sync attempt ${attempt} failed. Retrying in ${waitTime}ms...`);
                await delay(waitTime);
            }
        }
    }
    throw lastError;
}
