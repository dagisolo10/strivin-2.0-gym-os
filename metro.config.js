const { withNativewind } = require("nativewind/metro");
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

config.resolver.sourceExts.push("sql");

config.transformer.babelTransformerPath = require.resolve("./sql-transformer.js");

module.exports = withNativewind(config, { input: "./src/app/global.css" });