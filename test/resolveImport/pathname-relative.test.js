import { assert } from "@jsenv/assert"
import { resolveImport } from "../../index.js"

const root = `http://example.com/folder`

{
  const actual = resolveImport({
    specifier: "./foo.js",
    importer: `${root}/file.js`,
  })
  const expected = `${root}/foo.js`
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "./file.js",
    importer: `http://domain.com/bar.js`,
  })
  const expected = `http://domain.com/file.js`
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "../foo.js",
    importer: `${root}/subfolder/file.js`,
  })
  const expected = `${root}/foo.js`
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "../",
    importer: `${root}/subfolder/file.js`,
  })
  const expected = `${root}/`
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "../../../foo.js",
    importer: "file:///Users/file.js",
  })
  const expected = `file:///foo.js`
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "../file.js",
    importer: `https://domain.com/folder/bar.js`,
  })
  const expected = `https://domain.com/file.js`
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "../node_modules/bar/bar.js",
    importer: `${root}/node_modules/foo/folder/foo.js`,
  })
  const expected = `${root}/node_modules/foo/node_modules/bar/bar.js`
  assert({ actual, expected })
}
