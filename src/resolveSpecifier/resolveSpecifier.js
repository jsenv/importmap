import { hasFetchScheme } from "../hasFetchScheme.js"
import { resolveUrl } from "../resolveUrl/resolveUrl.js"

export const resolveSpecifier = (specifier, importer) => {
  if (specifier[0] === "/" || specifier.startsWith("./") || specifier.startsWith("../")) {
    return resolveUrl(specifier, importer)
  }

  if (hasFetchScheme(specifier)) {
    return specifier
  }

  return null
}
