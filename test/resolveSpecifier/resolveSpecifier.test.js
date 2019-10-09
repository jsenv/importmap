import { assert } from "@dmail/assert"
import { resolveSpecifier } from "../../index.js"

{
  const actual = resolveSpecifier("./file.js", "file:///Users/folder")
  const expected = "file:///Users/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveSpecifier("./file.js", "file:///Users/folder/")
  const expected = "file:///Users/folder/file.js"
  assert({ actual, expected })
}
