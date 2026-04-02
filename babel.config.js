module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo", "nativewind/babel"],
        plugins: [
            "babel-plugin-inline-import",

            [
                "module-resolver",
                {
                    root: ["./"],
                    alias: {
                        "@": "./src",
                    },
                },
            ],
            "react-native-reanimated/plugin",
        ],
    };
};
