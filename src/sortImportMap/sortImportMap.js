// https://github.com/WICG/import-maps/blob/93f94c6dfb268bde3009644b65580fb2fbb98fcf/reference-implementation/lib/parser.js#L42
import { assertImportMap } from "../assertImportMap.js"

export const sortImportMap = (importMap) => {
  assertImportMap(importMap)
  const { imports, scopes } = importMap
  const orderedImportMap = {
    imports: imports ? sortImportMapImports(imports) : {},
    scopes: scopes ? sortImportMapScopes(scopes) : {},
  }
  return orderedImportMap
}

const sortImportMapImports = (imports) => {
  const sortedImports = {}
  Object.keys(imports)
    .sort(compareLengthOrLocaleCompare)
    .forEach((name) => {
      sortedImports[name] = imports[name]
    })
  return sortedImports
}

const sortImportMapScopes = (scopes) => {
  const sortedScopes = {}
  Object.keys(scopes)
    .sort(compareLengthOrLocaleCompare)
    .forEach((scopeName) => {
      sortedScopes[scopeName] = sortScopedImports(scopes[scopeName], scopeName)
    })
  return sortedScopes
}

const compareLengthOrLocaleCompare = (a, b) => {
  return b.length - a.length || a.localeCompare(b)
}

const sortScopedImports = (scopedImports) => {
  const compareScopedImport = (a, b) => {
    // const aIsRoot = a === "/"
    // const bIsRoot = b === "/"
    // if (aIsRoot && !bIsRoot) return 1
    // if (!aIsRoot && bIsRoot) return -1
    // if (aIsRoot && bIsRoot) return 0

    // const aIsScope = a === scope
    // const bIsScope = b === scope
    // if (aIsScope && !bIsScope) return 1
    // if (!aIsScope && bIsScope) return -1
    // if (aIsScope && bIsScope) return 0

    return compareLengthOrLocaleCompare(a, b)
  }

  const sortedScopedImports = {}
  Object.keys(scopedImports)
    .sort(compareScopedImport)
    .forEach((name) => {
      sortedScopedImports[name] = scopedImports[name]
    })
  return sortedScopedImports
}
