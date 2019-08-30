import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

const actual = applyImportMap({
  importMap: {
    scopes: {
      "/node_modules/foo/": {
        "/node_modules/bar/": "/node_modules/foo/node_modules/bar/",
      },
    },
  },
  href: "https://example.com/node_modules/bar/src/bar.js",
  importerHref: "https://example.com/node_modules/foo/src/foo.js",
})
const expected = "https://example.com/node_modules/foo/node_modules/bar/src/bar.js"
assert({ actual, expected })
