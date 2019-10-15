import { assert } from "@dmail/assert"
import { resolveImport } from "../../index.js"

{
  const actual = resolveImport({
    specifier: "foo",
    importer: `file:///C:/folder/file.js`,
    defaultExtension: false,
  })
  const expected = `file:///C:/folder/foo`
  assert({ actual, expected })
}

{
  const origin = "http://example.com"
  const actual = resolveImport({
    specifier: "foo",
    importer: origin,
    importMap: {
      imports: {
        foo: `${origin}/node_modules/foo/src/foo.js`,
      },
    },
  })
  const expected = `${origin}/node_modules/foo/src/foo.js`
  assert({ actual, expected })
}

{
  const origin = "http://example.com"
  const actual = resolveImport({
    specifier: "foo/src/foo.js",
    importer: origin,
    importMap: {
      imports: {
        "foo/": `${origin}/node_modules/foo/`,
      },
    },
  })
  const expected = `${origin}/node_modules/foo/src/foo.js`
  assert({ actual, expected })
}
