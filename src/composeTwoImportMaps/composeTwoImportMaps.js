// https://github.com/systemjs/systemjs/blob/89391f92dfeac33919b0223bbf834a1f4eea5750/src/common.js#L136
import { assertImportMap } from "../assertImportMap.js"
import { sortImportMap } from "../sortImportMap/sortImportMap.js"

export const composeTwoImportMaps = (leftImportMap, rightImportMap) => {
  assertImportMap(leftImportMap)
  assertImportMap(rightImportMap)

  return sortImportMap({
    imports: composeTwoImports(leftImportMap.imports, rightImportMap.imports),
    scopes: composeTwoScopes(leftImportMap.scopes, rightImportMap.scopes),
  })
}

const composeTwoImports = (leftImports = {}, rightImports = {}) => {
  return { ...leftImports, ...rightImports }
}

const composeTwoScopes = (leftScopes = {}, rightScopes = {}) => {
  const scopes = { ...leftScopes }
  Object.keys(rightScopes).forEach((pattern) => {
    if (scopes.hasOwnProperty(pattern)) {
      scopes[pattern] = { ...scopes[pattern], ...rightScopes[pattern] }
    } else {
      scopes[pattern] = { ...rightScopes[pattern] }
    }
  })
  return scopes
}
