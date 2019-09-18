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

  const folderPattern = `/${folderRelativeName}/`
  const { imports, scopes } = importMap
  const importsWrapped = imports ? prefixImports(imports, folderPattern) : {}
  const scopesWrapped = scopes ? prefixScopes(scopes, folderPattern) : {}

  if (imports && "/" in imports) {
    scopesWrapped[folderPattern] = {
      [folderPattern]: folderPattern,
    }
  }

  return {
    imports: importsWrapped,
    scopes: scopesWrapped,
  }
}

// this function must make sure it returns imports so that
// Object.keys(imports).indexOf('/') === Object.keys(imports).length - 1
// Object.keys(imports).indexOf(folderPattern) === Object.keys(imports).length - 2
// even if imports already contains '/' or folderPattern
const ensureLeadingSlashImportWrapped = (imports, folderPattern) => {
  const wrappedImports = {}
  Object.keys(imports).forEach((key) => {
    if (key === "/" || key === folderPattern) return
    wrappedImports[key] = imports[key]
  })
  wrappedImports[folderPattern] = folderPattern
  wrappedImports["/"] = folderPattern
  return wrappedImports
}

const prefixImports = (imports, folderPattern) => {
  const importsPrefixed = {}
  Object.keys(imports).forEach((importKey) => {
    const importValue = imports[importKey]

    if (importValue === "/") {
      importsPrefixed[folderPattern] = folderPattern
    }

    if (importValue[0] === "/") {
      importsPrefixed[importKey] = `${folderPattern}${importValue.slice(1)}`
    }
  })
  return importsPrefixed
}

const prefixScopes = (scopes, folderPattern) => {
  const scopesPrefixed = {}
  Object.keys(scopes).forEach((scopeKey) => {
    if (scopeKey[0] === "/") {
      const scopeValue = scopes[scopeKey]
      const prefixedScopeKey = `${folderPattern}${scopeKey.slice(1)}`
      const prefixedScopeImports = prefixScopeImports(scopeValue, folderPattern, scopeKey)
      scopesPrefixed[prefixedScopeKey] =
        "/" in scopeValue
          ? ensureLeadingSlashImportWrapped(prefixedScopeImports, prefixedScopeKey)
          : prefixedScopeImports
    }
  })
  return scopesPrefixed
}

const prefixScopeImports = (imports, folderPattern, scopeKey) => {
  const importsPrefixed = {}
  Object.keys(imports).forEach((importKey) => {
    const importValue = imports[importKey]
    if (importValue[0] === "/") {
      const prefixedImportKey = importKey.startsWith(scopeKey)
        ? `${folderPattern.slice(0, -1)}${importKey}`
        : importKey
      importsPrefixed[prefixedImportKey] = `${folderPattern}${importValue.slice(1)}`
    }
  })
  return importsPrefixed
}
