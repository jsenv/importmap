import { assert } from "@jsenv/assert"
import { resolveImport } from "../../index.js"

const root = `http://example.com/folder`

{
  const actual = resolveImport({
    specifier: "/foo.js",
    importer: `${root}/file.js`,
  })
  const expected = `http://example.com/foo.js`
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "/node_modules/ask/ask.js",
    importer: `${root}/node_modules/foo/foo.js`,
  })
  const expected = `http://example.com/node_modules/ask/ask.js`
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "/node_modules/ask",
    importer: `${root}/node_modules/foo/foo.js`,
    defaultExtension: false,
  })
  const expected = `http://example.com/node_modules/ask`
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "/node_modules/bar/bar.js",
    importer: `${root}/node_modules/foo/foo.js`,
  })
  const expected = `http://example.com/node_modules/bar/bar.js`
  assert({ actual, expected })
}
