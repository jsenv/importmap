const { generateCommonJsBundle } = require("@jsenv/core")
const jsenvConfig = require("../../jsenv.config.js")

generateCommonJsBundle({
  ...jsenvConfig,
})
