import { assertImportMap } from "./internal/assertImportMap.js"
import { urlToPathname } from "./internal/urlToPathname.js"
import { hasScheme } from "./internal/hasScheme.js"

export const makeImportMapRelativeTo = (importMap, url) => {
  assertImportMap(importMap)

  const slashCount = urlToPathname(url).slice(1).split("/").length - 1
  if (slashCount === 0) {
    return importMap
  }

  const importMapRelative = {}
  const { imports } = importMap
  if (imports) {
    importMapRelative.imports = makeImportsRelativeTo(imports, url) || imports
  }

  const { scopes } = importMap
  if (scopes) {
    importMapRelative.scopes = makeScopedRemappingRelativeTo(scopes, url) || scopes
  }

  return importMapRelative
}

const makeScopedRemappingRelativeTo = (scopes, url) => {
  const scopesTransformed = {}
  const scopesRemaining = {}
  let transformed = false
  Object.keys(scopes).forEach((scopeKey) => {
    const scopeValue = scopes[scopeKey]
    const scopeKeyRelative = makeAddressRelativeTo(scopeKey, url)
    const scopeValueRelative = makeImportsRelativeTo(scopeValue, url)

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

const makeImportsRelativeTo = (imports, url) => {
  const importsTransformed = {}
  const importsRemaining = {}
  let transformed = false
  Object.keys(imports).forEach((importKey) => {
    const importValue = imports[importKey]
    const importKeyRelative = makeSpecifierRelativeTo(importKey, url)
    const importValueRelative = makeAddressRelativeTo(importValue, url)

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

const makeSpecifierRelativeTo = (specifier, url) => {
  if (specifier.startsWith("//")) {
    return null
  }

  if (specifier[0] === "/") {
    return null
  }

  if (specifier.startsWith("./")) {
    return makeRelativeTo(specifier.slice(2), url)
  }

  if (specifier.startsWith("../")) {
    return makeRelativeTo(specifier, url)
  }

  return null
}

const makeAddressRelativeTo = (address, url) => {
  if (address.startsWith("//")) {
    return null
  }

  if (address[0] === "/") {
    return null
  }

  if (address.startsWith("./")) {
    return makeRelativeTo(address.slice(2), url)
  }

  if (address.startsWith("../")) {
    return makeRelativeTo(address, url)
  }

  if (hasScheme(address)) {
    return null
  }

  // bare
  return makeRelativeTo(address, url)
}

const makeRelativeTo = (string, url) => {
  const slashCount = urlToPathname(url).slice(1).split("/").length - 1
  return `${`../`.repeat(slashCount)}${string}`
}
