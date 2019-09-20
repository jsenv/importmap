import { hrefToPathname } from "@jsenv/href/src/hrefToPathname/hrefToPathname.js"
import { pathnameToExtension } from "@jsenv/href/src/pathnameToExtension/pathnameToExtension.js"
import { resolveSpecifier } from "../resolveSpecifier/resolveSpecifier.js"
import { applyImportMap } from "../applyImportMap/applyImportMap.js"

export const resolveImport = ({ specifier, importer, importMap, defaultExtension = true }) => {
  const specifierResolved = resolveSpecifier(specifier, importer)
  const specifierRemapped = importMap
    ? applyImportMap({ importMap, href: specifierResolved, importerHref: importer })
    : specifierResolved
  if (typeof defaultExtension === "string") {
    const extension = pathnameToExtension(specifierRemapped)
    if (extension === "") {
      return `${specifierRemapped}${defaultExtension}`
    }
  }
  if (defaultExtension === true) {
    const extension = pathnameToExtension(specifierRemapped)
    if (extension === "") {
      if (importer) {
        const importerPathname = hrefToPathname(importer)
        const importerExtension = pathnameToExtension(importerPathname)
        return `${specifierRemapped}${importerExtension}`
      }
    }
  }
  return specifierRemapped
}
