const { execute, launchNode } = require("@jsenv/core")
const jsenvConfig = require("../../jsenv.config.js")

execute({
  ...jsenvConfig,
  launch: launchNode,
  fileRelativeUrl: process.argv[2],
})
