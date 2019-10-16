// directly target the files because this code
// will be executed either on node or browser
// and also we don't want to pull more code than necessary
// when this one gets bundled
import { hrefToPathname } from "@jsenv/href/src/hrefToPathname/hrefToPathname.js"
import { pathnameToExtension } from "@jsenv/href/src/pathnameToExtension/pathnameToExtension.js"
import { resolveUrl } from "../resolveUrl/resolveUrl.js"
import { applyImportMap } from "../applyImportMap/applyImportMap.js"

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
      const importerPathname = hrefToPathname(importer)
      const importerExtension = pathnameToExtension(importerPathname)
      return `${url}${importerExtension}`
    }
  }
  return url
}
