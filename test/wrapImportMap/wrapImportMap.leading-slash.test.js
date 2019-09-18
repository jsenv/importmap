import { assert } from "@dmail/assert"
import { wrapImportMap, applyImportMap } from "../../index.js"

// the idea here is to ensure a non matching scope
// is still not matching after being wrapped
const importMap = wrapImportMap(
  {
    imports: {
      "/": "/",
    },
  },
  "folder",
)
const actual = applyImportMap({
  importMap,
  href: `http://example.com/folder/bar.js`,
})
const expected = `http://example.com/folder/bar.js`
assert({ actual, expected })
