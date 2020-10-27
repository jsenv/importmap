import { assertImportMap } from "./internal/assertImportMap.js"
import { urlToRelativeUrl } from "./internal/urlToRelativeUrl.js"
import { resolveUrl } from "./resolveUrl.js"
import { resolveSpecifier } from "./resolveSpecifier.js"
import { hasScheme } from "./internal/hasScheme.js"

export const moveImportMap = (importMap, fromUrl, toUrl) => {
  assertImportMap(importMap)

  const makeRelativeTo = (value, type) => {
    let url
    if (type === "specifier") {
      url = resolveSpecifier(value, fromUrl)
      if (!url) {
        // bare specifier
        return value
      }
    } else {
      url = resolveUrl(value, fromUrl)
    }

    const relativeUrl = urlToRelativeUrl(url, toUrl)
    if (relativeUrl.startsWith("../")) {
      return relativeUrl
    }
    if (relativeUrl.startsWith("./")) {
      return relativeUrl
    }
    if (hasScheme(relativeUrl)) {
      return relativeUrl
    }
    return `./${relativeUrl}`
  }

  const importMapRelative = {}
  const { imports } = importMap
  if (imports) {
    importMapRelative.imports = makeImportsRelativeTo(imports, makeRelativeTo) || imports
  }

  const { scopes } = importMap
  if (scopes) {
    importMapRelative.scopes = makeScopedRemappingRelativeTo(scopes, makeRelativeTo) || scopes
  }

  // nothing changed
  if (importMapRelative.imports === imports && importMapRelative.scopes === scopes) {
    return importMap
  }
  return importMapRelative
}

const makeScopedRemappingRelativeTo = (scopes, makeRelativeTo) => {
  const scopesTransformed = {}
  const scopesRemaining = {}
  let transformed = false
  Object.keys(scopes).forEach((scopeKey) => {
    const scopeValue = scopes[scopeKey]
    const scopeKeyRelative = makeRelativeTo(scopeKey, "address")
    const scopeValueRelative = makeImportsRelativeTo(scopeValue, makeRelativeTo)

    if (scopeKeyRelative) {
      transformed = true
      scopesTransformed[scopeKeyRelative] = scopeValueRelative || scopeValue
    } else if (scopeValueRelative) {
      transformed = true
      scopesTransformed[scopeKey] = scopeValueRelative
    } else {
      scopesRemaining[scopeKey] = scopeValueRelative
    }
  })
  return transformed ? { ...scopesTransformed, ...scopesRemaining } : null
}

const makeImportsRelativeTo = (imports, makeRelativeTo) => {
  const importsTransformed = {}
  const importsRemaining = {}
  let transformed = false
  Object.keys(imports).forEach((importKey) => {
    const importValue = imports[importKey]
    const importKeyRelative = makeRelativeTo(importKey, "specifier")
    const importValueRelative = makeRelativeTo(importValue, "address")

    if (importKeyRelative) {
      transformed = true
      importsTransformed[importKeyRelative] = importValueRelative || importValue
    } else if (importValueRelative) {
      transformed = true
      importsTransformed[importKey] = importValueRelative
    } else {
      importsRemaining[importKey] = importValue
    }
  })
  return transformed ? { ...importsTransformed, ...importsRemaining } : null
}
