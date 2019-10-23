import { assert } from "@dmail/assert"
import { resolveImportForProject } from "../../index.js"

const root = import.meta.url

try {
  resolveImportForProject({
    projectPath: root,
    specifier: "foo",
    importer: root,
  })
  throw new Error("should throw")
} catch (actual) {
  const expected = new Error(`Unmapped bare specifier.
--- specifier ---
foo
--- importer ---
${root}`)
  assert({ actual, expected })
}
