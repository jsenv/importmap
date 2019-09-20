import { assert } from "@dmail/assert"
import { resolveImport } from "../../index.js"

const actual = resolveImport({
  specifier: "/whatever/foo.js",
  importer: `http://example.com/folder/file.js`,
  importMap: {
    scopes: {
      "/folder/": {
        "/whatever/": "/remapped/",
      },
    },
  },
})
const expected = `http://example.com/remapped/foo.js`
assert({ actual, expected })
