import { assert } from "@jsenv/assert"
import { resolveUrl } from "../../index.js"

{
  const actual = resolveUrl("foo", "http://domain.com")
  const expected = "http://domain.com/foo"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("foo", "http://domain.com/file.js")
  const expected = "http://domain.com/foo"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("foo", "http://domain.com/file.js/")
  const expected = "http://domain.com/file.js/foo"
  assert({ actual, expected })
}
