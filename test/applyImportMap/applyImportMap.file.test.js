import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

const actual = applyImportMap({
  importMap: {
    imports: {
      "foo.js": "file:///User/me/folder/foo.js",
    },
  },
  href: "http://example.com/foo.js",
})
const expected = "file:///User/me/folder/foo.js"
assert({ actual, expected })
