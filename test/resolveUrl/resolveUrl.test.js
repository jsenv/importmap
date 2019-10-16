import { assert } from "@dmail/assert"
import { resolveUrl } from "../../index.js"

{
  const actual = resolveUrl("./file.js", "file:///Users/folder")
  const expected = "file:///Users/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("./file.js", "file:///Users/folder/")
  const expected = "file:///Users/folder/file.js"
  assert({ actual, expected })
}

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

{ const actual = resolveUrl('../file.js', 'http://domain.com')}
