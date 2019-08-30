import { assert } from "@dmail/assert"
import { applyImportMap } from "../../index.js"

const actual = applyImportMap({
  importMap: {
    scopes: {
      "/.dist/best/node_modules/@dmail/assert/": {
        "/node_modules/@dmail/uneval/": "/.dist/best/node_modules/@dmail/uneval/",
      },
    },
  },
  href: "http://127.0.0.1:62322/node_modules/@dmail/uneval/index.js",
  importerHref:
    "http://127.0.0.1:62322/.dist/best/node_modules/@dmail/assert/src/toErrorMessage/propertiesComparisonToErrorMessage.js",
})
const expected = "http://127.0.0.1:62322/.dist/best/node_modules/@dmail/uneval/index.js"
assert({ actual, expected })
