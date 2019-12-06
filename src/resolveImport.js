import { urlToPathname } from "./internal/urlToPathname.js"
import { pathnameToExtension } from "./internal/pathnameToExtension.js"
import { resolveUrl } from "./resolveUrl.js"
import { applyImportMap } from "./applyImportMap.js"

export const resolveImport = ({ specifier, importer, importMap, defaultExtension = true }) => {
  return applyDefaultExtension({
    url: importMap
      ? applyImportMap({ importMap, specifier, importer })
      : resolveUrl(specifier, importer),
    importer,
    defaultExtension,
  })
}

const applyDefaultExtension = ({ url, importer, defaultExtension }) => {
  if (urlToPathname(url).endsWith("/")) {
    return url
  }

  if (typeof defaultExtension === "string") {
    const extension = pathnameToExtension(url)
    if (extension === "") {
      return `${url}${defaultExtension}`
    }
    return url
  }

  if (defaultExtension === true) {
    const extension = pathnameToExtension(url)
    if (extension === "" && importer) {
      const importerPathname = urlToPathname(importer)
      const importerExtension = pathnameToExtension(importerPathname)
      return `${url}${importerExtension}`
    }
  }
  return url
}
