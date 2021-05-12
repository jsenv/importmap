import { buildProject } from "@jsenv/core"
import * as jsenvConfig from "../../jsenv.config.js"

buildProject({
  ...jsenvConfig,
  buildDirectoryRelativeUrl: "./dist/esmodule",
  format: "esmodule",
  importResolutionMethod: "node",
  entryPointMap: {
    "./index.js": "./jsenv_importmap.js",
  },
  bundleDirectoryClean: true,
})
