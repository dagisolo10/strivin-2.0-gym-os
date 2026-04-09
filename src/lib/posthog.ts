import PostHog from "posthog-react-native";

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;

export const posthog = apiKey ? new PostHog(apiKey, { host: "https://us.i.posthog.com" }) : null;
