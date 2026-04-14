export default ({ config }) => {
    const env = process.env.APP_ENV;

    return {
        ...config,
        name: env === "dev" ? "Strivin Dev" : "Strivin",

        android: {
            ...config.android,
            package: env === "dev" ? "com.dagisolo.strivin.dev" : "com.dagisolo.strivin",
        },
        
        ios: {
            ...config.ios,
            bundleIdentifier: env === "dev" ? "com.dagisolo.strivin.dev" : "com.dagisolo.strivin",
        },
    };
};
