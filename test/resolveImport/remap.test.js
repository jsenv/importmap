import { assert } from "@jsenv/assert"
import { resolveImport } from "../../index.js"

const origin = "http://example.com"
const actual = resolveImport({
  specifier: "/whatever/foo.js",
  importer: `${origin}/folder/file.js`,
  importMap: {
    scopes: {
      [`${origin}/folder/`]: {
        [`${origin}/whatever/`]: `${origin}/remapped/`,
      },
    },
  },
})
const expected = `${origin}/remapped/foo.js`
assert({ actual, expected })
