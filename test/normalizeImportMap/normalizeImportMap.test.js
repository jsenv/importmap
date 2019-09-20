import { assert } from "@dmail/assert"
import { normalizeImportMap } from "../../index.js"

const actual = normalizeImportMap(
  {
    imports: {
      "../index.js": "main.js",
      "//domain.com/foo.js": "/bar.js",
      "http://domain.com/whatever.js": "./whatever.js",
    },
    scopes: {
      "foo/": {
        a: "a",
      },
      "bar/": {
        a: "a",
      },
    },
  },
  "https://example.com/folder/file.js",
)
const expected = {
  imports: {
    "http://domain.com/whatever.js": "https://example.com/folder/whatever.js",
    "https://example.com/index.js": "https://example.com/main.js",
    "https://domain.com/foo.js": "https://example.com/bar.js",
  },
  scopes: {
    "https://example.com/bar/": {
      "https://example.com/a": "https://example.com/a",
    },
    "https://example.com/foo/": {
      "https://example.com/a": "https://example.com/a",
    },
  },
}
assert({ actual, expected })
