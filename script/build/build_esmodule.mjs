import { buildProject } from "@jsenv/core"

import * as jsenvConfig from "../../jsenv.config.mjs"

await buildProject({
  ...jsenvConfig,
  buildDirectoryRelativeUrl: "./dist/esmodule/",
  importMapFileRelativeUrl: "./node_resolution.importmap",
  format: "esmodule",
  entryPointMap: {
    "./main.js": "./jsenv_importmap.js",
  },
  buildDirectoryClean: true,
})
