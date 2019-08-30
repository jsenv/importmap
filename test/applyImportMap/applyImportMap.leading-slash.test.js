import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

{
  const actual = applyImportMap({
    importMap: {
      scopes: {
        "/.dist/best/": {
          "/": "/.dist/best/",
          "/.dist/best/": "/.dist/best/",
        },
      },
    },
    href: "http://example.com/.dist/best/bar.js",
    importerHref: "http://example.com/.dist/best/foo.js",
  })
  // be very carefull on order otherwise .dist/best
  // is appended twice
  const expected = "http://example.com/.dist/best/.dist/best/bar.js"
  assert({ actual, expected })
}

{
  const actual = applyImportMap({
    importMap: {
      scopes: {
        "/.dist/best/": {
          "/.dist/best/": "/.dist/best/",
          "/": "/.dist/best/",
        },
      },
    },
    href: "http://example.com/.dist/best/bar.js",
    importer: "http://example.com/.dist/best/foo.js",
  })
  const expected = "http://example.com/.dist/best/bar.js"
  assert({ actual, expected })
}
