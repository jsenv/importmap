import { assert } from "@jsenv/assert"
import { composeTwoImportMaps } from "../../index.js"

const actual = composeTwoImportMaps(
  {
    imports: {
      foo: "a",
      a: "a",
    },
    scopes: {
      foo: {
        foo: "a",
        a: "a",
      },
      a: {},
    },
  },
  {
    imports: {
      foo: "b",
      b: "b",
    },
    scopes: {
      foo: {
        foo: "b",
        b: "b",
      },
      b: {},
    },
  },
)
const expected = {
  imports: {
    foo: "b",
    a: "a",
    b: "b",
  },
  scopes: {
    foo: {
      foo: "b",
      a: "a",
      b: "b",
    },
    a: {},
    b: {},
  },
}
assert({ actual, expected })
