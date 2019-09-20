import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

const origin = "https://example.com"
const actual = applyImportMap({
  importMap: {
    scopes: {
      [`${origin}/node_modules/foo/`]: {
        [`${origin}/node_modules/bar/`]: `${origin}/node_modules/foo/node_modules/bar/`,
      },
    },
  },
  href: `${origin}/node_modules/bar/src/bar.js`,
  importerHref: `${origin}/node_modules/foo/src/foo.js`,
})
const expected = `${origin}/node_modules/foo/node_modules/bar/src/bar.js`
assert({ actual, expected })
