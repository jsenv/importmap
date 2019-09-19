import { assert } from "@dmail/assert"
import { wrapImportMap, applyImportMap } from "../../index.js"

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
      "/folder/": {
        "/folder/foo": "/folder/bar",
        "/folder/a": "/folder/b",
        foo: "/folder/bar",
        a: "/folder/b",
        "/": "/",
      },
    },
  }
  assert({ actual, expected })
}

const noImporter = undefined
const importerRemapped = "special"
const importerWrapped = "folder"

// inside into stays inside
{
  const hrefInside = `http://example.com/folder/bar.js`
  const expected = `http://example.com/folder/bar.js`
  {
    const actual = applyImportMap({
      importMap,
      href: hrefInside,
      importerHref: noImporter,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefInside,
      importerHref: importerRemapped,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefInside,
      importerHref: importerWrapped,
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
      importMap,
      href: hrefOutside,
      importerHref: noImporter,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefOutside,
      importerHref: importerRemapped,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefOutside,
      importerHref: importerWrapped,
    })
    assert({ actual, expected })
  }
}

// outside with top level remapping -> remapped inside
{
  const hrefOutsideWithTopLevelRemapping = `http://example.com/a`
  const expected = `http://example.com/folder/b`
  {
    const actual = applyImportMap({
      importMap,
      href: hrefOutsideWithTopLevelRemapping,
      importerHref: noImporter,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefOutsideWithTopLevelRemapping,
      importerHref: importerRemapped,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefOutsideWithTopLevelRemapping,
      importerHref: importerWrapped,
    })
    assert({ actual, expected })
  }
}

// inside with top level remapping -> remapped inside
{
  const hrefInsideWithTopLevelRemapping = `http://example.com/folder/a`
  const expected = `http://example.com/folder/b`

  {
    const actual = applyImportMap({
      importMap,
      href: hrefInsideWithTopLevelRemapping,
      importerHref: noImporter,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefInsideWithTopLevelRemapping,
      importerHref: importerRemapped,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefInsideWithTopLevelRemapping,
      importerHref: importerWrapped,
    })
    assert({ actual, expected })
  }
}

// outside with scoped remapping -> remapped inside
{
  const hrefOutsideWithScopedRemapping = `http://example.com/a`
  const expected = `http://example.com/folder/c`

  {
    const actual = applyImportMap({
      importMap,
      href: hrefOutsideWithScopedRemapping,
      importerHref: noImporter,
    })
    // no importer, so we expect to fallback to top level remapping
    const expected = "http://example.com/folder/b"
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefOutsideWithScopedRemapping,
      importerHref: importerRemapped,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefOutsideWithScopedRemapping,
      importerHref: importerWrapped,
    })
    assert({ actual, expected })
  }
}

// inside with scoped remapping -> remapped inside
{
  const hrefInsideWithScopedRemapping = `http://example.com/folder/a`
  const expected = `http://example.com/folder/c`

  {
    const actual = applyImportMap({
      importMap,
      href: hrefInsideWithScopedRemapping,
      importerHref: noImporter,
    })
    // no importer, so we expect to fallback to top level remapping
    const expected = "http://example.com/folder/b"
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefInsideWithScopedRemapping,
      importerHref: importerRemapped,
    })
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefInsideWithScopedRemapping,
      importerHref: importerWrapped,
    })
    assert({ actual, expected })
  }
}
