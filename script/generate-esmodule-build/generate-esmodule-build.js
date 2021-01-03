import { buildProject } from "@jsenv/core"
import * as jsenvConfig from "../../jsenv.config.js"

buildProject({
  ...jsenvConfig,
  format: "esmodule",
  entryPointMap: {
    "./index.js": "./main.js",
  },
  bundleDirectoryClean: true,
})
