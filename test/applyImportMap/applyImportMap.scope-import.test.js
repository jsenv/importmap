import { assert } from "@dmail/assert"
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
    href: `${origin}/foo.js`,
    importerHref: `${origin}/file.js`,
  })
  const expected = `${origin}/bar.js`
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap,
    href: `${origin}/foo.js`,
    importerHref: `${origin}/folder/file.js`,
  })
  const expected = `${origin}/whatever.js`
  assert({ actual, expected })
}
