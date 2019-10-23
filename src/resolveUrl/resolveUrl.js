// could be useful: https://url.spec.whatwg.org/#url-miscellaneous

import { hasScheme } from "../hasScheme.js"
import { hrefToScheme } from "@jsenv/href/src/hrefToScheme/hrefToScheme.js"
import { hrefToPathname } from "@jsenv/href/src/hrefToPathname/hrefToPathname.js"
import { hrefToOrigin } from "@jsenv/href/src/hrefToOrigin/hrefToOrigin.js"
import { pathnameToDirname } from "@jsenv/href/src/pathnameToDirname/pathnameToDirname.js"

export const resolveUrl = (specifier, baseUrl) => {
  if (baseUrl) {
    if (typeof baseUrl !== "string") {
      throw new TypeError(writeBaseUrlMustBeAString({ baseUrl, specifier }))
    }
    if (!hasScheme(baseUrl)) {
      throw new Error(writeBaseUrlMustBeAbsolute({ baseUrl, specifier }))
    }
  }

  if (hasScheme(specifier)) {
    return specifier
  }

  if (!baseUrl) {
    throw new Error(writeBaseUrlRequired({ baseUrl, specifier }))
  }

  // scheme relative
  if (specifier.slice(0, 2) === "//") {
    return `${hrefToScheme(baseUrl)}:${specifier}`
  }

  // origin relative
  if (specifier[0] === "/") {
    return `${hrefToOrigin(baseUrl)}${specifier}`
  }

  const baseOrigin = hrefToOrigin(baseUrl)
  const basePathname = hrefToPathname(baseUrl)

  if (specifier === ".") {
    const baseDirname = pathnameToDirname(basePathname)
    return `${baseOrigin}${baseDirname}/`
  }

  // pathname relative inside
  if (specifier.slice(0, 2) === "./") {
    const baseDirname = pathnameToDirname(basePathname)
    return `${baseOrigin}${baseDirname}/${specifier.slice(2)}`
  }

  // pathname relative outside
  if (specifier.slice(0, 3) === "../") {
    let unresolvedPathname = specifier
    const importerFolders = basePathname.split("/")
    importerFolders.pop()

    while (unresolvedPathname.slice(0, 3) === "../") {
      unresolvedPathname = unresolvedPathname.slice(3)
      // when there is no folder left to resolved
      // we just ignore '../'
      if (importerFolders.length) {
        importerFolders.pop()
      }
    }

    const resolvedPathname = `${importerFolders.join("/")}/${unresolvedPathname}`
    return `${baseOrigin}${resolvedPathname}`
  }

  // bare
  if (basePathname === "") {
    return `${baseOrigin}/${specifier}`
  }
  if (basePathname[basePathname.length] === "/") {
    return `${baseOrigin}${basePathname}${specifier}`
  }
  return `${baseOrigin}${pathnameToDirname(basePathname)}/${specifier}`
}

const writeBaseUrlMustBeAString = ({ baseUrl, specifier }) => `baseUrl must be a string.
--- base url ---
${baseUrl}
--- specifier ---
${specifier}`

const writeBaseUrlMustBeAbsolute = ({ baseUrl, specifier }) => `baseUrl must be absolute.
--- base url ---
${baseUrl}
--- specifier ---
${specifier}`

const writeBaseUrlRequired = ({
  baseUrl,
  specifier,
}) => `baseUrl required to resolve relative specifier.
--- base url ---
${baseUrl}
--- specifier ---
${specifier}`
