import { assert } from "@dmail/assert"
import { wrapImportMap, applyImportMap } from "../../index.js"

const actual = applyImportMap({
  importMap: wrapImportMap(
    {
      imports: {
        foo: "/bar/file.js",
      },
    },
    "folder",
  ),
  href: `http://example.com/foo`,
  importerHref: `http://example.com/folder/file.js`,
})
const expected = `http://example.com/folder/bar/file.js`
assert({ actual, expected })
