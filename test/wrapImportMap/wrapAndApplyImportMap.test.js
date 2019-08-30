import { assert } from "@dmail/assert"
import { wrapImportMap, applyImportMap } from "../../index.js"

const importMap = {
  imports: {
    foo: "/bar/file.js",
  },
}
const wrappedImportMap = wrapImportMap(importMap, "folder")
const actual = applyImportMap({
  importMap: wrappedImportMap,
  href: `http://example.com/foo`,
  importerHref: `http://example.com/folder/file.js`,
})
const expected = `http://example.com/folder/bar/file.js`
assert({ actual, expected })
