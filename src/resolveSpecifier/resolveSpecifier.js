// could be useful: https://url.spec.whatwg.org/#url-miscellaneous

import { isAbsoluteSpecifier, resolveAbsoluteSpecifier } from "./absoluteSpecifier.js"
import {
  isSchemeRelativeSpecifier,
  resolveSchemeRelativeSpecifier,
} from "./schemeRelativeSpecifier.js"
import {
  isOriginRelativeSpecifier,
  resolveOriginRelativeSpecifier,
} from "./originRelativeSpecifier.js"
import {
  isPathnameRelativeSpecifier,
  resolvePathnameRelativeSpecifier,
} from "./pathnameRelativeSpecifier.js"
import { resolveBareSpecifier } from "./bareSpecifier.js"

export const resolveSpecifier = (specifier, importer) => {
  if (isAbsoluteSpecifier(specifier)) {
    return resolveAbsoluteSpecifier(specifier, importer)
  }

  if (!importer) {
    throw new Error(createMissingImporterMessage(specifier, importer))
  }

  if (isSchemeRelativeSpecifier(specifier)) {
    return resolveSchemeRelativeSpecifier(specifier, importer)
  }

  if (isOriginRelativeSpecifier(specifier)) {
    return resolveOriginRelativeSpecifier(specifier, importer)
  }

  if (isPathnameRelativeSpecifier(specifier)) {
    return resolvePathnameRelativeSpecifier(specifier, importer)
  }

  return resolveBareSpecifier(specifier, importer)
}

const createMissingImporterMessage = (
  specifier,
  importer,
) => `missing importer to resolve relative specifier.
--- specifier ---
${specifier}
--- importer ---
${importer}`
