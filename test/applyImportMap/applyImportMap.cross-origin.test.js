import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

const externalOrigin = "http://external.com"
const internalOrigin = "http://internal.com"

// remapping internal to external
{
  const importMap = {
    imports: {
      [`${internalOrigin}/foo.js`]: `${externalOrigin}/bar.js`,
    },
  }
  const actual = applyImportMap({
    importMap,
    href: `${internalOrigin}/foo.js`,
  })
  const expected = `${externalOrigin}/bar.js`
  assert({ actual, expected })
}

// remapping external to internal
{
  const importMap = {
    imports: {
      [`${externalOrigin}/foo.js`]: `${internalOrigin}/bar.js`,
    },
  }
  const actual = applyImportMap({
    importMap,
    href: `${externalOrigin}/foo.js`,
  })
  const expected = `${internalOrigin}/bar.js`
  assert({ actual, expected })
}

// remapping external to external
{
  const importMap = {
    imports: {
      [`${externalOrigin}/foo.js`]: `${externalOrigin}/bar.js`,
    },
  }
  const actual = applyImportMap({
    importMap,
    href: `${externalOrigin}/foo.js`,
  })
  const expected = `${externalOrigin}/bar.js`
  assert({ actual, expected })
}
