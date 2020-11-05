import { assert } from "@jsenv/assert"
import { composeTwoImportMaps, sortImportMap } from "../index.js"

{
  const actual = sortImportMap(
    composeTwoImportMaps(
      {
        imports: {
          foo: "a",
          a: "a",
        },
      },
      {
        imports: {
          foo: "b",
          b: "b",
        },
      },
    ),
  )
  const expected = {
    imports: {
      foo: "b",
      a: "a",
      b: "b",
    },
  }
  assert({ actual, expected })
}

{
  const actual = sortImportMap(
    composeTwoImportMaps(
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
    ),
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
}

// resolve first top level import with second top level import
{
  const actual = sortImportMap(
    composeTwoImportMaps(
      {
        imports: {
          foo: "a",
        },
      },
      {
        imports: {
          a: "./b.js",
        },
      },
    ),
  )
  const expected = {
    imports: {
      foo: "./b.js",
      a: "./b.js",
    },
  }
  assert({ actual, expected })
}

// resolve in scopes too
{
  const actual = sortImportMap(
    composeTwoImportMaps(
      {
        scopes: {
          directory: {
            foo: "./a.js",
          },
        },
      },
      {
        scopes: {
          directory: {
            "./a.js": "./b.js",
          },
        },
      },
    ),
  )
  const expected = {
    scopes: {
      directory: {
        "./a.js": "./b.js",
        "foo": "./b.js",
      },
    },
  }
  assert({ actual, expected })
}
