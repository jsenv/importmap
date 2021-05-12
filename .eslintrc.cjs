const {
  composeEslintConfig,
  eslintConfigBase,
  eslintConfigForPrettier,
  eslintConfigToPreferExplicitGlobals,
  jsenvEslintRules,
  jsenvEslintRulesForImport,
} = require("@jsenv/eslint-config")

const eslintConfig = composeEslintConfig(
  eslintConfigBase,
  {
    rules: jsenvEslintRules,
  },
  {
    env: {
      node: true,
    },
  },
  {
    plugins: ["import"],
    settings: {
      "import/resolver": {
        "@jsenv/importmap-eslint-resolver": {
          projectDirectoryUrl: __dirname,
          importMapFileRelativeUrl: "./import-map.importmap",
          node: true,
        },
      },
    },
    rules: jsenvEslintRulesForImport,
  },
  // inside *.cjs files:
  // 1. restore commonJS "globals"
  // 2. use commonjs module resolution
  {
    overrides: [
      {
        files: ["**/*.cjs"],
        env: {
          node: true,
          commonjs: true,
        },
        settings: {
          "import/resolver": {
            node: {},
          },
        },
      },
    ],
  },
  eslintConfigToPreferExplicitGlobals,
  eslintConfigForPrettier,
)

module.exports = eslintConfig
