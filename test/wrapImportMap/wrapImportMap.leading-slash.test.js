import { assert } from "@jsenv/assert"
import { wrapImportMap, normalizeImportMap, applyImportMap } from "../../index.js"

const importMap = wrapImportMap(
  {
    imports: {
      "/": "/",
      "ding": "/dong",
    },
    scopes: {
      "/scope/": {
        "ding": "/dong-dong",
        "/scope/": `/scope/`,
        "/": `/scope/`,
      },
    },
  },
  "into",
)

{
  const actual = importMap
  const expected = {
    imports: {
      "/into/": "/into/",
      "ding": "/into/dong",
      "/": `/into/`,
    },
    scopes: {
      "/into/scope/": {
        "ding": `/into/dong-dong`,
        "/into/scope/": `/into/scope/`,
        "/scope/": `/into/scope/`,
        "/into/": `/into/scope/`,
        "/": `/into/scope/`,
      },
      "/scope/": {
        "ding": `/into/dong-dong`,
        "/into/scope/": `/into/scope/`,
        "/scope/": `/into/scope/`,
        "/into/": `/into/scope/`,
        "/": `/into/scope/`,
      },
      "/into/": {
        "/into/": `/into/`,
      },
    },
  }
  assert({ actual, expected })
}

const importMapNormalized = normalizeImportMap(importMap, "http://example.com")

// file remapping
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "http://example.com/file.js",
    importer: undefined,
  })
  const expected = "http://example.com/into/file.js"
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "./file.js",
    importer: "http://example.com/into/importer.js",
  })
  const expected = "http://example.com/into/file.js"
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "./file.js",
    importer: "http://example.com/scope/importer.js",
  })
  const expected = "http://example.com/into/scope/file.js"
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "./file.js",
    importer: "http://example.com/into/scope/importer.js",
  })
  const expected = "http://example.com/into/scope/file.js"
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "./file.js",
    importer: "http://example.com/scope/into/importer.js",
  })
  const expected = "http://example.com/into/scope/into/file.js"
  assert({ actual, expected })
}

// bare specifier remapping
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "ding",
    importer: undefined,
  })
  const expected = "http://example.com/into/dong"
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "ding",
    importer: "http://example.com/into/importer.js",
  })
  const expected = "http://example.com/into/dong"
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "ding",
    importer: "http://example.com/scope/importer.js",
  })
  const expected = "http://example.com/into/dong-dong"
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "ding",
    importer: "http://example.com/into/scope/importer.js",
  })
  const expected = "http://example.com/into/dong-dong"
  assert({ actual, expected })
}
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "ding",
    importer: "http://example.com/scope/into/importer.js",
  })
  const expected = "http://example.com/into/dong-dong"
  assert({ actual, expected })
}
