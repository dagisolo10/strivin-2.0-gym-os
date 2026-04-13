import { DAY_ORDER } from "@/constants/data";

export function getDateKeys(date = new Date()) {
    return date.toISOString().slice(0, 10);
}

export function getDateKey(date: Date | string = new Date()) {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().split("T")[0];
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

export const mapToSnakeCase = (obj: Record<string, any>, tableName?: string) => {
    const snakeObj: Record<string, any> = {};
    const mapping = tableName ? TABLE_FIELD_MAPPING[tableName] : null;

    Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const snakeKey = mapping && mapping[key] ? mapping[key] : toSnakeCase(key);

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

export const mapToCamelCase = (obj: Record<string, any>, tableName?: string) => {
    const camelObj: Record<string, any> = {};
    const mapping = tableName ? TABLE_FIELD_MAPPING[tableName] : null;

    const reverseMapping: Record<string, string> = {};

    if (mapping) {
        Object.entries(mapping).forEach(([camel, snake]) => (reverseMapping[snake] = camel));
    }

    Object.keys(obj).forEach((key) => {
        const camelKey = reverseMapping[key] ? reverseMapping[key] : toCamelCase(key);
        const value = obj[key];

        if (typeof value === "boolean" && ["isDeleted", "perfectDay", "completed"].includes(camelKey)) {
            camelObj[camelKey] = value ? 1 : 0;
        } else {
            camelObj[camelKey] = value;
        }
    });

    return camelObj;
};

export const TABLE_FIELD_MAPPING: Record<string, Record<string, string>> = {
    workout_plans: {
        workoutDaysPerWeek: "days_per_week",
    },
};
