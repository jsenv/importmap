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
    importerUrl: importer,
    defaultExtension,
  })
}

const applyDefaultExtension = ({ url, importerUrl, extension }) => {
  if (typeof extension === "string") {
    const extension = pathnameToExtension(url)
    if (extension === "") {
      return `${url}${extension}`
    }
    return url
  }

  if (extension === true) {
    const extension = pathnameToExtension(importerUrl)
    if (extension === "" && importerUrl) {
      const importerPathname = hrefToPathname(importerUrl)
      const importerExtension = pathnameToExtension(importerPathname)
      return `${url}${importerExtension}`
    }
  }
  return url
}
