import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

const actual = applyImportMap({
  importMap: {
    scopes: {
      "/build/best/": {
        "/foo.js": "/bar.js",
      },
    },
  },
  href: "http://example.com/foo.js",
  importerHref: "http://example.com/build/best/folder/file.js",
})
const expected = "http://example.com/bar.js"
assert({ actual, expected })
