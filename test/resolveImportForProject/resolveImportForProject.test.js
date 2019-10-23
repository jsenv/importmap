import { assert } from "@dmail/assert"
import { resolveImportForProject, resolveUrl } from "../../index.js"

// once @jsenv/compile-server, @jsenv/execution, @jsenv/node-launcher and @jsenv/testing
// are updated to latest @jsenv/import-map
// we can replace resolveUrl('.', import.meta.url) by import.meta.resolve('.')
const projectPath = resolveUrl(".", import.meta.url)
const importer = import.meta.url

try {
  resolveImportForProject({
    projectPath,
    specifier: "foo",
    importer,
  })
  throw new Error("should throw")
} catch (actual) {
  const expected = new Error(`Unmapped bare specifier.
--- specifier ---
foo
--- importer ---
${importer}`)
  assert({ actual, expected })
}

try {
  resolveImportForProject({
    projectPath,
    specifier: "../file.js",
    importer,
  })
  throw new Error("should throw")
} catch (actual) {
  const expected = new Error(`import must be inside project.
--- import url ---
${resolveUrl("../file.js", projectPath)}
--- project path ---
${projectPath}
--- specifier ---
../file.js
--- importer ---
${importer}`)
  assert({ actual, expected })
}
