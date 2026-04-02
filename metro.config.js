const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("sql");

config.transformer.babelTransformerPath = require.resolve("./sql-transformer.js");

module.exports = withNativewind(config, { input: "./src/app/global.css" });
