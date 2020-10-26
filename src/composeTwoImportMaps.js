// https://github.com/systemjs/systemjs/blob/89391f92dfeac33919b0223bbf834a1f4eea5750/src/common.js#L136
import { assertImportMap } from "./internal/assertImportMap.js"

export const composeTwoImportMaps = (leftImportMap, rightImportMap) => {
  assertImportMap(leftImportMap)
  assertImportMap(rightImportMap)

  const importMap = {}

  const leftImports = leftImportMap.imports
  const rightImports = rightImportMap.imports
  const leftHasImports = Boolean(leftImports)
  const rightHasImports = Boolean(rightImports)
  if (leftHasImports && rightHasImports) {
    importMap.imports = composeTwoImports(leftImports, rightImports)
  } else if (leftHasImports) {
    importMap.imports = { ...leftImports }
  } else if (rightHasImports) {
    importMap.imports = { ...rightImports }
  }

  const leftScopes = leftImportMap.scopes
  const rightScopes = rightImportMap.scopes
  const leftHasScopes = Boolean(leftScopes)
  const rightHasScopes = Boolean(rightScopes)
  if (leftHasScopes && rightHasScopes) {
    importMap.scopes = composeTwoScopes(leftScopes, rightScopes)
  } else if (leftHasScopes) {
    importMap.scopes = { ...leftScopes }
  } else if (rightHasScopes) {
    importMap.scopes = { ...rightScopes }
  }

  return importMap
}

const composeTwoImports = (leftImports, rightImports) => {
  return {
    ...leftImports,
    ...rightImports,
  }
}

const composeTwoScopes = (leftScopes, rightScopes) => {
  const scopes = {
    ...leftScopes,
  }
  Object.keys(rightScopes).forEach((scopeKey) => {
    if (scopes.hasOwnProperty(scopeKey)) {
      scopes[scopeKey] = {
        ...scopes[scopeKey],
        ...rightScopes[scopeKey],
      }
    } else {
      scopes[scopeKey] = {
        ...rightScopes[scopeKey],
      }
    }
  })
  return scopes
}
