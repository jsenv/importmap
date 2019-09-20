import { hrefToOrigin } from "@jsenv/href/src/hrefToOrigin/hrefToOrigin.js"

// "/folder/file.js"
export const isOriginRelativeSpecifier = (specifier) => {
  const firstChar = specifier[0]
  if (firstChar !== "/") return false

  const secondChar = specifier[1]
  if (secondChar === "/") return false

  return true
}

export const resolveOriginRelativeSpecifier = (specifier, importer) => {
  const importerOrigin = hrefToOrigin(importer)

  return `${importerOrigin}/${specifier.slice(1)}`
}
