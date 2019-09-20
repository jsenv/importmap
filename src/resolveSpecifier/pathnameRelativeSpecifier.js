// https://github.com/systemjs/systemjs/blob/master/src/common.js
import { hrefToPathname } from "@jsenv/href/src/hrefToPathname/hrefToPathname.js"
import { hrefToOrigin } from "@jsenv/href/src/hrefToOrigin/hrefToOrigin.js"
import { pathnameToDirname } from "@jsenv/href/src/pathnameToDirname/pathnameToDirname.js"

// "./folder/file.js"
// "../folder/file.js"
export const isPathnameRelativeSpecifier = (specifier) => {
  if (specifier.slice(0, 2) === "./") return true

  if (specifier.slice(0, 3) === "../") return true

  return false
}

export const resolvePathnameRelativeSpecifier = (specifier, importer) => {
  const importerPathname = hrefToPathname(importer)

  // ./foo.js on /folder/file.js -> /folder/foo.js
  // ./foo/bar.js on /folder/file.js -> /folder/foo/bar.js
  // ./foo.js on /folder/subfolder/file.js -> /folder/subfolder/foo.js
  if (specifier.slice(0, 2) === "./") {
    const importerOrigin = hrefToOrigin(importer)
    const importerDirname = pathnameToDirname(importerPathname)
    return `${importerOrigin}${importerDirname}/${specifier.slice(2)}`
  }

  // ../foo/bar.js on /folder/file.js -> /foo/bar.js
  // ../foo/bar.js on /folder/subfolder/file.js -> /folder/foo/bar.js
  // ../../foo/bar.js on /folder/file.js -> /foo/bar.js
  // ../bar.js on / -> /bar.js
  let unresolvedPathname = specifier
  const importerFolders = importerPathname.split("/")
  importerFolders.pop() // remove file, it is not a folder

  while (unresolvedPathname.slice(0, 3) === "../") {
    // when there is no folder left to resolved
    // we just ignore '../'
    if (importerFolders.length) {
      importerFolders.pop()
    }
    unresolvedPathname = unresolvedPathname.slice(3)
  }

  const importerOrigin = hrefToOrigin(importer)
  const resolvedPathname = `${importerFolders.join("/")}/${unresolvedPathname}`

  return `${importerOrigin}${resolvedPathname}`
}
