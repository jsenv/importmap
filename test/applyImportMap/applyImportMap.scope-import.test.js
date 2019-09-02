import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

const actual = applyImportMap({
  importMap: {
    imports: {
      "/foo.js": "/bar.js",
    },
    scopes: {
      "/folder/": {
        "whatever.js": "whatever-2.js",
      },
    },
  },
  href: "http://example.com/foo.js",
  importerHref: "http://example.com/folder/file.js",
})
const expected = "http://example.com/bar.js"
assert({ actual, expected })
