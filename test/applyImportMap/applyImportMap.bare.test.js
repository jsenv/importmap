import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

const origin = "http://example.com"
const importMap = {
  imports: {
    [`${origin}/@babel/plugin-proposal-object-rest-spread`]: `${origin}/node_modules/@babel/plugin-proposal-object-rest-spread/lib/index.js`,
  },
}
const actual = applyImportMap({
  importMap,
  href: `${origin}/@babel/plugin-proposal-object-rest-spread`,
  importerHref: `${origin}/file.js`,
})
const expected = `${origin}/node_modules/@babel/plugin-proposal-object-rest-spread/lib/index.js`
assert({ actual, expected })
