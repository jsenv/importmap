import {
  executeTestPlan,
  chromiumTabRuntime,
  firefoxTabRuntime,
  webkitTabRuntime,
  nodeRuntime,
} from "@jsenv/core"

import * as jsenvConfig from "../../jsenv.config.mjs"

await executeTestPlan({
  ...jsenvConfig,
  testPlan: {
    "test/**/*.test.mjs": {
      node: {
        runtime: nodeRuntime,
      },
    },
    "test/**/*.test.html": {
      chromium: {
        runtime: chromiumTabRuntime,
      },
      firefox: {
        runtime: firefoxTabRuntime,
      },
      webkit: {
        runtime: webkitTabRuntime,
      },
    },
  },
  coverageV8MergeConflictIsExpected: true,
})
