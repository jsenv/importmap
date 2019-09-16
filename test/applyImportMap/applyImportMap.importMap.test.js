import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

const actual = applyImportMap({
  importMap: {
    imports: {
      "/.jsenv/importMap.json": "file:///Users/me/importMap.json",
    },
  },
  href: "http://example.com/.jsenv/importMap.json",
  importerHref: "http://example.com/folder/file.js",
})
const expected = "file:///Users/me/importMap.json"
assert({ actual, expected })
