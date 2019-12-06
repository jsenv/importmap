import { assert } from "@jsenv/assert"
import { resolveImport } from "../../index.js"

const root = import.meta.url

{
  const actual = resolveImport({
    specifier: "https://code.jquery.com/jquery-3.3.1.min.js",
    importer: root,
  })
  const expected = "https://code.jquery.com/jquery-3.3.1.min.js"
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "file:///Users/file.js",
    importer: root,
  })
  const expected = "file:///Users/file.js"
  assert({ actual, expected })
}
