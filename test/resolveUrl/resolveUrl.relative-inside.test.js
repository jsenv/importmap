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
  const actual = resolveUrl("./file.js", "http://domain.com")
  const expected = "http://domain.com/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("./file.js", "http://domain.com/")
  const expected = "http://domain.com/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("./file.js", "http://domain.com/folder")
  const expected = "http://domain.com/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("./file.js", "http://domain.com/folder/")
  const expected = "http://domain.com/folder/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("./file.js", "http://domain.com/folder/foo.js")
  const expected = "http://domain.com/folder/file.js"
  assert({ actual, expected })
}
