import { startExploring, jsenvExplorableConfig } from "@jsenv/core"
import * as jsenvConfig from "../../jsenv.config.js"

startExploring({
  ...jsenvConfig,
  port: 3457,
  protocol: "http",
  explorableConfig: {
    ...jsenvExplorableConfig,
  },
  livereloading: true,
})
