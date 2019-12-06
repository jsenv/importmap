import { assert } from "@jsenv/assert"
import { applyImportMap } from "../../index.js"

const origin = "http://example.com"
const importMap = {
  imports: {
    [`${origin}/foo.js`]: `${origin}/bar.js`,
  },
  scopes: {
    [`${origin}/folder/`]: {
      [`${origin}/foo.js`]: `${origin}/whatever.js`,
    },
  },
}

{
  const actual = applyImportMap({
    importMap,
    specifier: `${origin}/foo.js`,
    importer: `${origin}/file.js`,
  })
  const expected = `${origin}/bar.js`
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap,
    specifier: `${origin}/foo.js`,
    importer: `${origin}/folder/file.js`,
  })
  const expected = `${origin}/whatever.js`
  assert({ actual, expected })
}
