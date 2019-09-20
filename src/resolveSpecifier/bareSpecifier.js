import { hrefToOrigin } from "@jsenv/href/src/hrefToOrigin/hrefToOrigin.js"
import { isAbsoluteSpecifier } from "./absoluteSpecifier.js"
import { isSchemeRelativeSpecifier } from "./schemeRelativeSpecifier.js"
import { isOriginRelativeSpecifier } from "./originRelativeSpecifier.js"
import { isPathnameRelativeSpecifier } from "./pathnameRelativeSpecifier.js"

export const isBareSpecifier = (specifier) => {
  if (isAbsoluteSpecifier(specifier)) return false

  if (isSchemeRelativeSpecifier(specifier)) return false

  if (isOriginRelativeSpecifier(specifier)) return false

  if (isPathnameRelativeSpecifier(specifier)) return false

  return true
}

export const resolveBareSpecifier = (specifier, importer) => {
  const importerOrigin = hrefToOrigin(importer)

  return `${importerOrigin}/${specifier}`
}
