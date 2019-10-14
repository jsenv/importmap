import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

const origin = "file://"
const importMap = {
  imports: {
    [`${origin}/foo.js`]: `${origin}/User/me/folder/foo.js`,
  },
}
const actual = applyImportMap({
  importMap,
  specifier: `${origin}/foo.js`,
})
const expected = `${origin}/User/me/folder/foo.js`
assert({ actual, expected })
