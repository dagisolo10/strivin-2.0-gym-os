export const toOptionalNumber = (t: string) => {
    if (t.trim() === "") return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
};
