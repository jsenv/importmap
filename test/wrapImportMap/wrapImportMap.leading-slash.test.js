import { assert } from "@dmail/assert"
import { wrapImportMap, applyImportMap } from "../../index.js"

const importMap = wrapImportMap(
  {
    imports: {
      "/": "/",
    },
    scopes: {
      "/special/": {
        foo: "bar",
        "/special/": "/special/",
        "/": "/special/",
      },
    },
  },
  "folder",
)

{
  const actual = importMap
  const expected = {
    imports: {
      "/folder/": "/folder/",
      "/": "/folder/",
    },
    scopes: {
      "/folder/special/": {
        "/folder/foo": "/folder/bar",
        foo: "/folder/bar",
        "/folder/special/": "/folder/special/",
        "/special/": "/folder/special/",
        "/folder/": "/folder/special/",
        "/": "/folder/special/",
      },
      "/special/": {
        foo: "/folder/bar",
        "/special/": "/folder/special/",
        "/": "/folder/special/",
      },
      "/folder/": {
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

// scoped remapping outside
{
  const hrefOutsideWithScopedRemapping = "http://example.com/foo"
  {
    const actual = applyImportMap({
      importMap,
      href: hrefOutsideWithScopedRemapping,
      importerHref: noImporter,
    })
    // no importer, so we expect to fallback to top level remapping
    const expected = "http://example.com/folder/foo"
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefOutsideWithScopedRemapping,
      importerHref: importerRemapped,
    })
    const expected = "http://example.com/folder/bar"
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefOutsideWithScopedRemapping,
      importerHref: importerWrapped,
    })
    const expected = "http://example.com/folder/foo"
    assert({ actual, expected })
  }
}

// scoped remapping inside
{
  const hrefInsideWithScopedRemapping = "http://example.com/folder/foo"
  {
    const actual = applyImportMap({
      importMap,
      href: hrefInsideWithScopedRemapping,
      importerHref: noImporter,
    })
    // no importer, so we expect to fallback to top level remapping
    const expected = "http://example.com/folder/foo"
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefInsideWithScopedRemapping,
      importerHref: importerRemapped,
    })
    const expected = "http://example.com/folder/special/folder/foo"
    assert({ actual, expected })
  }
  {
    const actual = applyImportMap({
      importMap,
      href: hrefInsideWithScopedRemapping,
      importerHref: importerWrapped,
    })
    const expected = "http://example.com/folder/foo"
    assert({ actual, expected })
  }
}
