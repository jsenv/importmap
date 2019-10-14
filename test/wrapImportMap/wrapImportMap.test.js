import { assert } from "@dmail/assert"
import { wrapImportMap, normalizeImportMap, applyImportMap } from "../../index.js"

const importMap = wrapImportMap(
  {
    imports: {
      foo: "/bar",
      a: "/b",
    },
    scopes: {
      "/special/": {
        ding: "/dong",
        a: "/c",
      },
    },
  },
  "folder",
)

{
  const actual = importMap
  const expected = {
    imports: {
      "/folder/foo": "/folder/bar",
      "/folder/a": "/folder/b",
      foo: "/folder/bar",
      a: "/folder/b",
      "/folder/": "/folder/",
      "/": "/folder/",
    },
    scopes: {
      "/folder/special/": {
        "/folder/ding": "/folder/dong",
        "/folder/a": "/folder/c",
        ding: "/folder/dong",
        a: "/folder/c",
      },
      "/special/": {
        ding: "/folder/dong",
        a: "/folder/c",
      },
      "/folder/": {
        "/folder/foo": "/folder/bar",
        "/folder/a": "/folder/b",
        foo: "/folder/bar",
        a: "/folder/b",
        "/folder/": "/folder/",
        "/": "/folder/",
      },
    },
  }
  assert({ actual, expected })
}

const noImporter = undefined
const importerRemapped = "http://example.com/special/whatever.js"
const importerWrapped = "http://example.com/folder/whatever.js"
const importMapNormalized = normalizeImportMap(importMap, "http://example.com")

// inside into stays inside
{
  const hrefInside = `http://example.com/folder/bar.js`
  const expected = `http://example.com/folder/bar.js`
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefInside,
      importer: noImporter,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefInside,
      importer: importerRemapped,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefInside,
      importer: importerWrapped,
    })
    assert({ actual, expected })
  }
}

// outside into gets inside
{
  const hrefOutside = `http://example.com/bar.js`
  const expected = `http://example.com/folder/bar.js`
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefOutside,
      importer: noImporter,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefOutside,
      importer: importerRemapped,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefOutside,
      importer: importerWrapped,
    })
    assert({ actual, expected })
  }
}

// outside with top level remapping -> remapped inside
{
  const hrefOutsideWithTopLevelRemapping = `http://example.com/a`
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefOutsideWithTopLevelRemapping,
      importer: noImporter,
    })
    const expected = `http://example.com/folder/b`
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefOutsideWithTopLevelRemapping,
      importer: importerRemapped,
    })
    const expected = "http://example.com/folder/c"
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefOutsideWithTopLevelRemapping,
      importer: importerWrapped,
    })
    const expected = `http://example.com/folder/b`
    assert({ actual, expected })
  }
}

// inside with top level remapping -> remapped inside
{
  const hrefInsideWithTopLevelRemapping = `http://example.com/folder/a`
  const expected = `http://example.com/folder/b`

  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefInsideWithTopLevelRemapping,
      importer: noImporter,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefInsideWithTopLevelRemapping,
      importer: importerRemapped,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefInsideWithTopLevelRemapping,
      importer: importerWrapped,
    })
    assert({ actual, expected })
  }
}

// outside with scoped remapping -> remapped inside
{
  const hrefOutsideWithScopedRemapping = `http://example.com/a`

  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefOutsideWithScopedRemapping,
      importer: noImporter,
    })
    // no importer, so we expect to fallback to top level remapping
    const expected = "http://example.com/folder/b"
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefOutsideWithScopedRemapping,
      importer: importerRemapped,
    })
    const expected = `http://example.com/folder/c`
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefOutsideWithScopedRemapping,
      importer: importerWrapped,
    })
    const expected = `http://example.com/folder/b`
    assert({ actual, expected })
  }
}

// inside with scoped remapping -> remapped inside
{
  const hrefInsideWithScopedRemapping = `http://example.com/folder/a`
  const expected = `http://example.com/folder/c`

  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefInsideWithScopedRemapping,
      importer: noImporter,
    })
    // no importer, so we expect to fallback to top level remapping
    const expected = "http://example.com/folder/b"
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefInsideWithScopedRemapping,
      importer: importerRemapped,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap: importMapNormalized,
      specifier: hrefInsideWithScopedRemapping,
      importer: importerWrapped,
    })
    assert({ actual, expected })
  }
}

// inside scope
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "http://example.com/ding",
    importer: importerRemapped,
  })
  const expected = "http://example.com/folder/dong"
  assert({ actual, expected })
}

// ensure folder after scope does not remap
{
  const actual = applyImportMap({
    importMap: importMapNormalized,
    specifier: "http://example.com/folder/a",
    importer: "http://example.com/special/folder/whatever.js",
  })
  const expected = "http://example.com/folder/b"
  assert({ actual, expected })
}
