/**
 * wrapImportMap can be used to remap all your imports under a folder.
 *
 * It is used by jsenv to import from a compiled folder instead of source folder.
 *
 * wrapImportMap must preserve the import map order so that
 * applyImportMap can still match the most specific pattern first.
 *
 * Because order is directly connected to the pattern length
 * prefixing every pattern with something does not means we have to sort
 * the wrappedImportMap.
 *
 * However we must absolutely ensure if an import like '/' exists in imports
 * or scoped imports. It must remain the last when being prefixed.
 *
 */

import { assertImportMap } from "../assertImportMap.js"

export const wrapImportMap = (importMap, folderRelativeName) => {
  assertImportMap(importMap)

  const into = `/${folderRelativeName}/`
  const { imports, scopes } = importMap

  let importsForWrapping
  let scopesForWrapping

  if (scopes) {
    scopesForWrapping = {}
    Object.keys(scopes).forEach((scopeKey) => {
      const scopeValue = scopes[scopeKey]
      const scopeKeyPrefixed = wrapSpecifier(scopeKey, into)

      if (scopeKeyPrefixed === scopeKey) {
        scopesForWrapping[scopeKey] = scopeValue
      } else {
        scopesForWrapping[scopeKeyPrefixed] = wrapImports(scopeValue, into)
      }
    })
  } else {
    scopesForWrapping = {}
  }

  if (imports) {
    importsForWrapping = wrapImports(imports, into)
    scopesForWrapping[into] = wrapImports(imports, into)
  } else {
    importsForWrapping = {}
    scopesForWrapping[into] = {}
  }

  // ensure anything not directly remapped is remapped inside into
  importsForWrapping[into] = into
  importsForWrapping["/"] = into
  // and when already into, you stay inside
  scopesForWrapping[into][into] = into
  scopesForWrapping[into]["/"] = into

  return {
    imports: importsForWrapping,
    scopes: scopesForWrapping,
  }
}

const wrapImports = (imports, into) => {
  const importsWithKeyWrapped = {}
  const importsRemaining = {}

  Object.keys(imports).forEach((importKey) => {
    const importValue = imports[importKey]
    const importKeyWrapped = wrapSpecifier(importKey, into)
    const importValueWrapped = wrapSpecifier(importValue, into)

    if (importKeyWrapped === importKey) {
      importsRemaining[importKey] = importValue
    } else if (importValueWrapped === importValue) {
      importsWithKeyWrapped[importKeyWrapped] = importValue
    } else {
      importsWithKeyWrapped[importKeyWrapped] = importValueWrapped
      importsRemaining[importKey] = importValueWrapped
    }
  })

  const importsWrapped = {
    ...importsWithKeyWrapped,
    ...importsRemaining,
  }
  return importsWrapped
}

const wrapSpecifier = (specifier, into) => {
  if (isOriginRelativeSpecifier(specifier)) {
    return `${into}${specifier.slice(1)}`
  }
  if (isBareSpecifier(specifier)) {
    return `${into}${specifier}`
  }
  return specifier
}

const isOriginRelativeSpecifier = (specifier) => {
  return specifier[0] === "/" && specifier[1] !== "/"
}

const isBareSpecifier = (specifier) => {
  // it has a scheme
  if (/^[a-zA-Z]+:/.test(specifier)) return false

  // scheme relative
  if (specifier.slice(0, 2) === "//") return false

  // pathname relative
  if (specifier.slice(0, 2) === "./") return false
  if (specifier.slice(0, 3) === "../") return false

  return true
}
