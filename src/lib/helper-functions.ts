import { DAY_ORDER } from "@/constants/data";

export function getDateKey(date = new Date()) {
    return date.toISOString().slice(0, 10);
}

export function formatDateLabel(value: string) {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", weekday: "short" }).format(new Date(value));
}

export function getWeekdayName(date = new Date()) {
    return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date) as Weekday;
}

export function sortWorkoutDays(days: Weekday[]) {
    return days.sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b]);
}

const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const toCamelCase = (str: string) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

export const mapToSnakeCase = (obj: Record<string, any>) => {
    const snakeObj: Record<string, any> = {};

    Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const snakeKey = toSnakeCase(key);

        if (typeof value === "number" && (snakeKey === "is_deleted" || snakeKey === "perfect_day" || snakeKey === "completed")) {
            snakeObj[snakeKey] = value === 1;
        } else if (value instanceof Date) {
            snakeObj[snakeKey] = value.toISOString();
        } else {
            snakeObj[snakeKey] = value;
        }
    });

    return snakeObj;
};

export const mapToCamelCase = (obj: Record<string, any>) => {
    const camelObj: Record<string, any> = {};

    Object.keys(obj).forEach((key) => {
        const camelKey = toCamelCase(key);
        camelObj[camelKey] = obj[key];
    });

    return camelObj;
};
