import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

const externalOrigin = "http://external.com"
const internalOrigin = "http://internal.com"

// remapping internal to external
{
  const actual = applyImportMap({
    importMap: {
      imports: {
        "foo.js": `${externalOrigin}/bar.js`,
      },
    },
    href: `${internalOrigin}/foo.js`,
  })
  const expected = `${externalOrigin}/bar.js`
  assert({ actual, expected })
}

// remapping external to internal
{
  const actual = applyImportMap({
    importMap: {
      imports: {
        [`${externalOrigin}/foo.js`]: "/bar.js",
      },
    },
    href: `${externalOrigin}/foo.js`,
  })
  const expected = `${internalOrigin}/bar.js`
  assert({ actual, expected })
}

// remapping external to external
{
  const actual = applyImportMap({
    importMap: {
      imports: {
        [`${externalOrigin}/foo.js`]: `${externalOrigin}/bar.js`,
      },
    },
    href: `${externalOrigin}/foo.js`,
  })
  const expected = `${externalOrigin}/bar.js`
  assert({ actual, expected })
}
