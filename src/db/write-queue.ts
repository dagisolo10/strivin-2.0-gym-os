let writeQueue: Promise<void> = Promise.resolve();

export function enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
    const result = writeQueue.then(operation, operation);
    writeQueue = result.then(
        () => undefined,
        () => undefined,
    );
    return result;
}
