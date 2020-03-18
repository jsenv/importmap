import { generateEsModuleBundle } from "@jsenv/core"
import * as jsenvConfig from "../../jsenv.config.js"

generateEsModuleBundle({
  ...jsenvConfig,
  bundleDirectoryClean: true,
})
