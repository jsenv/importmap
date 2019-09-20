import { hrefToScheme } from "@jsenv/href"

// "//folder/file.js"
export const isSchemeRelativeSpecifier = (specifier) => {
  return specifier.slice(0, 2) === "//"
}

export const resolveSchemeRelativeSpecifier = (specifier, importer) => {
  return `${hrefToScheme(importer)}:${specifier}`
}
