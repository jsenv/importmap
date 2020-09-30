import { assert } from "@jsenv/assert"
import { makeImportMapRelativeTo } from "../src/makeImportMapRelativeTo.js"

// basic test
{
  const actual = makeImportMapRelativeTo(
    {
      imports: {
        foo: "./bar.js",
      },
      scopes: {
        "./dir/": {
          hey: "./hey.js",
        },
      },
    },
    "http://example.com/dir/project.importmap",
  )
  const expected = {
    imports: {
      foo: "../bar.js",
    },
    scopes: {
      "../dir/": {
        hey: "../hey.js",
      },
    },
  }
  assert({ actual, expected })
}
