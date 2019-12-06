import { assert } from "@jsenv/assert"
import { applyImportMap } from "../../index.js"

const origin = "http://example.com"

{
  const importMap = {
    imports: {
      [`${origin}/foo`]: `${origin}/bar.js`,
    },
  }
  const actual = applyImportMap({
    importMap,
    specifier: `${origin}/foo`,
    importer: `${origin}/folder/file.js`,
  })
  const expected = `${origin}/bar.js`
  assert({ actual, expected })
}

{
  const importMap = {
    imports: {
      [`${origin}/foo`]: `${origin}/foo.js`,
    },
  }
  const actual = applyImportMap({
    importMap,
    specifier: `${origin}/foobar`,
    importer: `${origin}/folder/file.js`,
  })
  const expected = `${origin}/foobar`
  assert({ actual, expected })
}
