import { assert } from "@jsenv/assert"
import { resolveUrl } from "../../index.js"

{
  const actual = resolveUrl("../", "http://domain.com/folder/file.js")
  const expected = "http://domain.com/"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("../", "http://domain.com/folder/subfolder/file.js")
  const expected = "http://domain.com/folder/"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("../../", "http://domain.com/folder/file.js")
  const expected = "http://domain.com/"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("../file.js", "http://domain.com")
  const expected = "http://domain.com/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("../file.js", "http://domain.com/")
  const expected = "http://domain.com/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("../file.js", "http://domain.com/folder")
  const expected = "http://domain.com/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("../file.js", "http://domain.com/folder/")
  const expected = "http://domain.com/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("../file.js", "http://domain.com/folder/subfolder")
  const expected = "http://domain.com/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("../file.js", "http://domain.com/folder/foo.js")
  const expected = "http://domain.com/file.js"
  assert({ actual, expected })
}

{
  const actual = resolveUrl("../../file.js", "http://domain.com")
  const expected = "http://domain.com/file.js"
  assert({ actual, expected })
}