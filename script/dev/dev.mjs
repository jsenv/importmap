import { startDevServer } from "@jsenv/core"

import { projectDirectoryUrl } from "../../jsenv.config.mjs"

await startDevServer({
  projectDirectoryUrl,
  compileServerPort: 3457,
  explorableConfig: {
    test: {
      "test/**/*.html": true,
    },
  },
})
