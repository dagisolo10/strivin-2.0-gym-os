const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.resolver.assetExts.push("sql");
config.resolver.sourceExts = config.resolver.sourceExts.filter((ext) => ext !== "sql");

module.exports = withNativewind(config, { input: "./src/app/global.css" });
