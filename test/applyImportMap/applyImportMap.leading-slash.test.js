import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

const origin = "http://example.com"

{
  const actual = applyImportMap({
    importMap: {
      scopes: {
        [`${origin}/.dist/best/`]: {
          [`${origin}/`]: `${origin}/.dist/best/`,
          [`${origin}/.dist/best/`]: `${origin}/.dist/best/`,
        },
      },
    },
    specifier: `${origin}/.dist/best/bar.js`,
    importer: `${origin}/.dist/best/foo.js`,
  })
  // order is important: here .dist/best is appended twice
  const expected = `${origin}/.dist/best/.dist/best/bar.js`
  assert({ actual, expected })
}

{
  const actual = applyImportMap({
    importMap: {
      scopes: {
        [`${origin}/.dist/best/`]: {
          [`${origin}/.dist/best/`]: `${origin}/.dist/best/`,
          [`${origin}/`]: `${origin}/.dist/best/`,
        },
      },
    },
    specifier: `${origin}/.dist/best/bar.js`,
    importer: `${origin}/.dist/best/foo.js`,
  })
  const expected = `${origin}/.dist/best/bar.js`
  assert({ actual, expected })
}
