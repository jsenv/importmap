import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

const actual = applyImportMap({
  importMap: {
    imports: {
      "@babel/plugin-proposal-object-rest-spread":
        "/node_modules/@babel/plugin-proposal-object-rest-spread/lib/index.js",
    },
  },
  href: "@babel/plugin-proposal-object-rest-spread",
  importerHref: "http://example.com/file.js",
})
const expected =
  "http://example.com/node_modules/@babel/plugin-proposal-object-rest-spread/lib/index.js"
assert({
  actual,
  expected,
})
