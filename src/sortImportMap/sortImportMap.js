import { assertImportMap } from "../assertImportMap.js"

export const sortImportMap = (importMap) => {
  assertImportMap(importMap)

  const { imports, scopes } = importMap
  return {
    imports: imports ? sortImports(imports) : undefined,
    scopes: scopes ? sortScopes(scopes) : undefined,
  }
}

export const sortImports = (imports) => {
  const importsSorted = {}
  Object.keys(imports)
    .sort(compareLengthOrLocaleCompare)
    .forEach((name) => {
      importsSorted[name] = imports[name]
    })
  return importsSorted
}

export const sortScopes = (scopes) => {
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
