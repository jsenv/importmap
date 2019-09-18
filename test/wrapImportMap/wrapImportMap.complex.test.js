import { assert } from "@dmail/assert"
import { wrapImportMap, applyImportMap } from "../../index.js"

// the idea here is to ensure a non matching scope
// is still not matching after being wrapped
const actual = applyImportMap({
  importMap: wrapImportMap(
    {
      imports: {
        "@jsenv/core/": "/node_modules/@jsenv/compile-server/node_modules/@jsenv/core/",
      },
      scopes: {
        "/node_modules/@jsenv/compile-server/node_modules/@jsenv/core": {
          whatever: "/whatever.js",
        },
      },
    },
    "folder",
  ),
  href: `http://example.com/@jsenv/core/bar.js`,
  importerHref: `http://example.com/folder/node_modules/@jsenv/compile-server/node_modules/@jsenv/core/foo.js`,
})
const expected = `http://example.com/folder/node_modules/@jsenv/compile-server/node_modules/@jsenv/core/bar.js`
assert({ actual, expected })
