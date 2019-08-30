import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

// auto wrap in a folder
{
  const actual = applyImportMap({
    importMap: {
      scopes: {
        "/build/best/": {
          "/build/best/": "/build/best/",
          "/": "/build/best/",
        },
      },
    },
    href: "http://example.com/foo.js",
    importerHref: "http://example.com/build/best/folder/file.js",
  })
  const expected = "http://example.com/build/best/foo.js"
  assert({ actual, expected })
}

// do not wrap when already inside
{
  const actual = applyImportMap({
    importMap: {
      scopes: {
        "/build/best/": {
          "/build/best/": "/build/best/",
          "/": "/build/best/",
        },
      },
    },
    href: "http://example.com/node_modules/use-scoped-foo/use-scoped-foo.js",
    importerHref: "http://example.com/build/best/scoped-node-module.js",
  })
  const expected = "http://example.com/build/best/node_modules/use-scoped-foo/use-scoped-foo.js"
  assert({ actual, expected })
}

// when already inside the folder, do not reappend folder
{
  const actual = applyImportMap({
    importMap: {
      imports: {
        "use-scoped-foo/": "/build/best/node_modules/use-scoped-foo/",
      },
      scopes: {
        "/build/best/node_modules/use-scoped-foo/": {
          "/node_modules/foo/": "/build/best/node_modules/use-scoped-foo/node_modules/foo/",
        },
      },
    },
    href: "http://example.com/use-scoped-foo/use-scoped-foo.js",
    importerHref: "http://example.com/build/best/scoped-node-module.js",
  })
  const expected = "http://example.com/build/best/node_modules/use-scoped-foo/use-scoped-foo.js"
  assert({ actual, expected })
}

{
  const actual = applyImportMap({
    importMap: {
      scopes: {
        "/build/best/node_modules/foo/": {
          "/node_modules/bar/": "/build/best/node_modules/foo/node_modules/bar/",
        },
      },
    },
    href: "http://example.com/node_modules/bar/src/bar.js",
    importerHref: "https://example.com/build/best/node_modules/foo/src/foo.js",
  })
  const expected = "https://example.com/build/best/node_modules/foo/node_modules/bar/src/bar.js"
  assert({ actual, expected })
}

{
  const actual = applyImportMap({
    importMap: {
      scopes: {
        "/build/best/": {
          "/foo": "/build/best/foo/index.js",
        },
      },
    },
    href: "http://example.com/foo",
    importerHref: "https://example.com/build/best/folder/file.js",
  })
  const expected = "https://example.com/build/best/foo/index.js"
  assert({ actual, expected })
}

{
  const actual = applyImportMap({
    importMap: {
      scopes: {
        "/build/best/": {
          "/foo/": "/build/best/node_modules/foo/",
        },
      },
    },
    href: "http://example.com/foo/src/foo.js",
    importerHref: "https://example.com/build/best/folder/file.js",
  })
  const expected = "https://example.com/build/best/node_modules/foo/src/foo.js"
  assert({ actual, expected })
}
