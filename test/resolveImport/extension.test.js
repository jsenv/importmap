import { assert } from "@dmail/assert"
import { resolveImport } from "../../index.js"

{
  const actual = resolveImport({
    specifier: "logic.v2.min.js",
    importer: "http://example.com",
    defaultExtension: ".ts",
  })
  const expected = "http://example.com/logic.v2.min.js"
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "/example.net/site/page.php",
    importer: "http://example.com",
    defaultExtension: ".js",
  })
  const expected = "http://example.com/example.net/site/page.php"
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "/site/page.html",
    importer: "http://example.com",
    defaultExtension: ".js",
  })
  const expected = "http://example.com/site/page.html"
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "file",
    importer: "http://example.com",
    defaultExtension: ".js",
  })
  const expected = "http://example.com/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "file.",
    importer: "http://example.com",
    defaultExtension: ".js",
  })
  const expected = "http://example.com/file."
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "file",
    importer: "http://example.com",
  })
  const expected = "http://example.com/file"
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "file",
    importer: "http://example.com/index.js",
  })
  const expected = "http://example.com/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveImport({
    specifier: "file",
    importer: "http://example.com/index.ts?foo=bar",
  })
  const expected = "http://example.com/file.ts"
  assert({ actual, expected })
}
