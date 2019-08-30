import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

{
  const actual = applyImportMap({
    importMap: {
      imports: {
        foo: "/bar.js",
      },
    },
    href: "http://example.com/foo",
    importerHref: "http://example.com/folder/file.js",
  })
  const expected = "http://example.com/bar.js"
  assert({
    actual,
    expected,
  })
}

{
  const actual = applyImportMap({
    importMap: {
      imports: {
        foo: "/foo.js",
      },
    },
    href: "http://example.com/foobar",
    importerHref: "http://example.com/folder/file.js",
  })
  const expected = "http://example.com/foobar"
  assert({
    actual,
    expected,
  })
}
