import { buildProject } from "@jsenv/core"

import * as jsenvConfig from "../../jsenv.config.mjs"

await buildProject({
  ...jsenvConfig,
  buildDirectoryRelativeUrl: "./dist/commonjs/",
  format: "commonjs",
  entryPointMap: {
    "./main.js": "./jsenv_importmap.cjs",
  },
  runtimeSupport: {
    node: "14.7",
  },
  buildDirectoryClean: true,
})
