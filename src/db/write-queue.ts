let writeQueue: Promise<void> = Promise.resolve();

export function enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
    const result = writeQueue.then(operation, operation);
    writeQueue = result.then(
        () => undefined,
        () => undefined,
    );
    return result;
}

export function enqueueWrites<T>(operation: () => Promise<T>): Promise<T> {
    const run = async () => {
        try {
            return await operation();
        } catch (e) {
            throw e;
        }
    };

    const result = writeQueue.then(run, run);

    writeQueue = result.then(
        () => {},
        () => {},
    );

    return result;
}
