import { assertImportMap } from "../assertImportMap.js"
import { resolveSpecifier } from "../resolveSpecifier/resolveSpecifier.js"
import { sortImports, sortScopes } from "../sortImportMap/sortImportMap.js"

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
