[2026-04-04 22:52] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "edit approval",
    "EXPECTATION": "Only address the reactive exercise logging issue and do not change anything else; explain planned edits before touching files and do not overwrite files without explicit approval.",
    "NEW INSTRUCTION": "WHEN file changes are needed THEN propose changes and obtain approval before editing"
}

[2026-04-04 23:07] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "scope correction",
    "EXPECTATION": "Focus only on the home screen and the exercise card to make exercise logging reactive and working, without touching other screens already updated to use the singleton Drizzle DB.",
    "NEW INSTRUCTION": "WHEN user specifies target files or components THEN limit analysis and edits to them only"
}

[2026-04-06 14:26] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "extraction location & dedup",
    "EXPECTATION": "Move extracted components into their respective screen folders, merge duplicate exercise-variant components across add and onboarding while respecting zod/non-zod variants, and use the single source of truth data file instead of hard-coded arrays.",
    "NEW INSTRUCTION": "WHEN extracting UI components THEN place files in their respective screen folders"
}

