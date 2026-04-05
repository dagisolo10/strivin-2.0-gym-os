export const toOptionalNumber = (t: string) => {
    if (t.trim() === "") return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
};

export function getDateKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
}

export function formatDateLabel(value: string) {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", weekday: "short" }).format(new Date(value));
}

export function getWeekdayName(date = new Date()) {
    return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date) as Weekday;
}
