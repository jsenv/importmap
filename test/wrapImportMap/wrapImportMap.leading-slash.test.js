import { assert } from "@dmail/assert"
import { wrapImportMap, normalizeImportMap, applyImportMap } from "../../index.js"

const into = "folder"
const scopePath = "special"
const importMap = wrapImportMap(
  {
    imports: {
      "/": "/",
    },
    scopes: {
      [`/${scopePath}/`]: {
        foo: "bar",
        [`/${scopePath}/`]: `/${scopePath}/`,
        "/": `/${scopePath}/`,
      },
    },
  },
  into,
)

{
  const actual = importMap
  const expected = {
    imports: {
      [`/${into}/`]: `/${into}/`,
      "/": `/${into}/`,
    },
    scopes: {
      [`/${into}/${scopePath}/`]: {
        [`/${into}/foo`]: `/${into}/bar`,
        foo: `/${into}/bar`,
        [`/${into}/${scopePath}/`]: `/${into}/${scopePath}/`,
        [`/${scopePath}/`]: `/${into}/${scopePath}/`,
        [`/${into}/`]: `/${into}/${scopePath}/`,
        "/": `/${into}/${scopePath}/`,
      },
      [`/${scopePath}/`]: {
        foo: `/${into}/bar`,
        [`/${scopePath}/`]: `/${into}/${scopePath}/`,
        "/": `/${into}/${scopePath}/`,
      },
      [`/${into}/`]: {
        [`/${into}/`]: `/${into}/`,
        "/": `/${into}/`,
      },
    },
  }
  assert({ actual, expected })
}

const noImporter = undefined
const origin = "http://example.com"
const importerRemapped = `${origin}/${scopePath}/whatever.js`
const importerWrapped = `${origin}/${into}/whatever.js`
const importMapNormalized = normalizeImportMap(importMap, origin)

// scoped remapping outside
{
  const hrefOutsideWithScopedRemapping = `${origin}/foo`
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefOutsideWithScopedRemapping,
      importer: noImporter,
    })
    // no importer, so we expect to fallback to top level remapping
    const expected = `${origin}/${into}/foo`
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefOutsideWithScopedRemapping,
      importer: importerRemapped,
    })
    const expected = `${origin}/${into}/bar`
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefOutsideWithScopedRemapping,
      importer: importerWrapped,
    })
    const expected = `${origin}/${into}/foo`
    assert({ actual, expected })
  }
}

// scoped remapping inside
{
  const hrefInsideWithScopedRemapping = "http://example.com/folder/foo"
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefInsideWithScopedRemapping,
      importer: noImporter,
    })
    // no importer, so we expect to fallback to top level remapping
    const expected = `${origin}/${into}/foo`
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefInsideWithScopedRemapping,
      importer: importerRemapped,
    })
    const expected = `${origin}/${into}/${scopePath}/${into}/foo`
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefInsideWithScopedRemapping,
      importer: importerWrapped,
    })
    const expected = `${origin}/${into}/foo`
    assert({ actual, expected })
  }
}
