// https://github.com/systemjs/systemjs/blob/89391f92dfeac33919b0223bbf834a1f4eea5750/src/common.js#L136
import { assertImportMap } from "./internal/assertImportMap.js"
import { resolveUrl } from "./resolveUrl.js"

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
    importMap.scopes = composeTwoScopes(leftScopes, rightScopes, importMap.imports || {})
  } else if (leftHasScopes) {
    importMap.scopes = { ...leftScopes }
  } else if (rightHasScopes) {
    importMap.scopes = { ...rightScopes }
  }

  return importMap
}

const composeTwoImports = (leftImports, rightImports) => {
  const topLevelMappings = {}
  Object.keys(leftImports).forEach((leftSpecifier) => {
    if (objectHasKey(rightImports, leftSpecifier)) {
      // will be overidden
      return
    }
    const leftAddress = leftImports[leftSpecifier]
    const rightSpecifier = Object.keys(rightImports).find((rightSpecifier) => {
      return compareAddressAndSpecifier(leftAddress, rightSpecifier)
    })
    topLevelMappings[leftSpecifier] = rightSpecifier ? rightImports[rightSpecifier] : leftSpecifier
  })

  Object.keys(rightImports).forEach((rightSpecifier) => {
    topLevelMappings[rightSpecifier] = rightImports[rightSpecifier]
  })

  return topLevelMappings
}

const objectHasKey = (object, key) => Object.prototype.hasOwnProperty.call(object, key)

const compareAddressAndSpecifier = (address, specifier) => {
  const addressUrl = resolveUrl(address, "file:///")
  const specifierUrl = resolveUrl(specifier, "file:///")
  return addressUrl === specifierUrl
}

const composeTwoScopes = (leftScopes, rightScopes, topLevelRemappings) => {
  const scopedRemappings = {}
  Object.keys(leftScopes).forEach((leftScopeKey) => {
    if (objectHasKey(rightScopes, leftScopeKey)) {
      // will be merged
      scopedRemappings[leftScopeKey] = leftScopes[leftScopeKey]
      return
    }
    const topLevelSpecifier = Object.keys(topLevelRemappings).find((topLevelSpecifierCandidate) => {
      return compareAddressAndSpecifier(leftScopeKey, topLevelSpecifierCandidate)
    })
    if (topLevelSpecifier) {
      scopedRemappings[topLevelRemappings[topLevelSpecifier]] = leftScopes[leftScopeKey]
    } else {
      scopedRemappings[leftScopeKey] = leftScopes[leftScopeKey]
    }
  })

  Object.keys(rightScopes).forEach((rightScopeKey) => {
    if (objectHasKey(scopedRemappings, rightScopeKey)) {
      scopedRemappings[rightScopeKey] = composeTwoImports(
        scopedRemappings[rightScopeKey],
        rightScopes[rightScopeKey],
      )
    } else {
      scopedRemappings[rightScopeKey] = {
        ...rightScopes[rightScopeKey],
      }
    }
  })
  return scopedRemappings
}
