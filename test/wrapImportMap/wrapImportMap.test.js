import { assert } from "@jsenv/assert"
import { wrapImportMap, normalizeImportMap, applyImportMap } from "../../index.js"

const importMap = wrapImportMap(
  {
    imports: {
      ding: "/dong",
      a: "/b",
      into: "whatever",
    },
    scopes: {
      "/scope/": {
        a: "/c",
      },
    },
  },
  "into",
)

{
  const actual = importMap
  const expected = {
    imports: {
      "ding": "/into/dong",
      "a": "/into/b",
      "into": "/into/whatever",
      "/into/": "/into/",
      "/": "/into/",
    },
    scopes: {
      "/into/scope/": {
        a: "/into/c",
      },
      "/scope/": {
        a: "/into/c",
      },
      "/into/": {
        "/into/": "/into/",
      },
    },
  }
  assert({ actual, expected })
}

const importMapNormalized = normalizeImportMap(importMap, "http://example.com")

// already inside into stays inside
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "http://example.com/into/file.js",
    importer: undefined,
  })
  const expected = "http://example.com/into/file.js"
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "http://example.com/into/file.js",
    importer: "http://example.com/into/importer.js",
  })
  const expected = "http://example.com/into/file.js"
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "http://example.com/into/file.js",
    importer: "http://example.com/scope/importer.js",
  })
  const expected = "http://example.com/into/file.js"
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "http://example.com/into/file.js",
    importer: "http://example.com/into/scope/importer.js",
  })
  const expected = "http://example.com/into/file.js"
  assert({ actual, expected })
}

// outside into gets inside
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: `http://example.com/file.js`,
    importer: undefined,
  })
  const expected = `http://example.com/into/file.js`
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: `http://example.com/file.js`,
    importer: `http://example.com/into/importer.js`,
  })
  const expected = `http://example.com/into/file.js`
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: `http://example.com/file.js`,
    importer: `http://example.com/scope/importer.js`,
  })
  const expected = `http://example.com/into/file.js`
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: `http://example.com/file.js`,
    importer: `http://example.com/into/scope/importer.js`,
  })
  const expected = `http://example.com/into/file.js`
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "http://example.com/file.js",
    importer: "http://example.com/scope/into/importer.js",
  })
  const expected = "http://example.com/into/file.js"
  assert({ actual, expected })
}

// bare specifier with top level remapping -> remapped inside
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "a",
    importer: undefined,
  })
  const expected = `http://example.com/into/b`
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "a",
    importer: `http://example.com/into/importer.js`,
  })
  const expected = `http://example.com/into/b`
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "a",
    importer: `http://example.com/scope/importer.js`,
  })
  const expected = "http://example.com/into/c"
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "a",
    importer: `http://example.com/into/scope/importer.js`,
  })
  const expected = "http://example.com/into/c"
  assert({ actual, expected })
}

// into === bare specifier
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "into",
    importer: undefined,
  })
  const expected = "http://example.com/into/whatever"
  assert({ actual, expected })
}
