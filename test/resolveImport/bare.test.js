import { assert } from "@dmail/assert"
import { resolveImport } from "../../index.js"

{
  const actual = resolveImport({
    specifier: "foo",
    importer: `file:///C:/folder/file.js`,
    defaultExtension: false,
  })
  // import 'foo' from 'file:///C:/folder/file.js'
  // must resolve to 'file:///foo' to be spec compliant
  // it won't resolve to 'file:///C:/foo'
  // it's not a big deal there is zero real world scenario for this
  const expected = `file:///foo`
  assert({ actual, expected })
}

{
  const origin = "http://example.com"
  const actual = resolveImport({
    specifier: "foo",
    importer: origin,
    importMap: {
      imports: {
        [`${origin}/foo`]: `${origin}/node_modules/foo/src/foo.js`,
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
        [`${origin}/foo/`]: `${origin}/node_modules/foo/`,
      },
    },
  })
  const expected = `${origin}/node_modules/foo/src/foo.js`
  assert({ actual, expected })
}