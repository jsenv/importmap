import { resolveSpecifier } from "../resolveSpecifier/resolveSpecifier.js"
import { assertImportMap } from "../assertImportMap.js"

export const normalizeImportMap = (importMap, href) => {
  assertImportMap(importMap)
  if (typeof href !== "string") {
    throw new TypeError(`href must be a string, got ${href}`)
  }

  const { imports, scopes } = importMap
  return {
    imports: imports ? normalizeImports(imports, href) : undefined,
    scopes: scopes ? normalizeScopes(scopes, href) : undefined,
  }
}

const normalizeImports = (imports, href) => {
  const importsNormalized = {}
  Object.keys(imports).forEach((importKey) => {
    const importValue = imports[importKey]
    const importKeyNormalized = resolveSpecifier(importKey, href)
    const importValueNormalized = resolveSpecifier(importValue, href)
    importsNormalized[importKeyNormalized] = importValueNormalized
  })
  return sortImports(importsNormalized)
}

const normalizeScopes = (scopes, href) => {
  const scopesNormalized = {}
  Object.keys(scopes).forEach((scopeKey) => {
    const scopeValue = scopes[scopeKey]
    const scopeKeyNormalized = resolveSpecifier(scopeKey, href)
    const scopeValueNormalized = normalizeImports(scopeValue, href)
    scopesNormalized[scopeKeyNormalized] = scopeValueNormalized
  })
  return sortScopes(scopesNormalized)
}

const sortImports = (imports) => {
  const importsSorted = {}
  Object.keys(imports)
    .sort(compareLengthOrLocaleCompare)
    .forEach((name) => {
      importsSorted[name] = imports[name]
    })
  return importsSorted
}

const sortScopes = (scopes) => {
  const scopesSorted = {}
  Object.keys(scopes)
    .sort(compareLengthOrLocaleCompare)
    .forEach((scopeName) => {
      scopesSorted[scopeName] = sortImports(scopes[scopeName])
    })
  return scopesSorted
}

const compareLengthOrLocaleCompare = (a, b) => {
  return b.length - a.length || a.localeCompare(b)
}
