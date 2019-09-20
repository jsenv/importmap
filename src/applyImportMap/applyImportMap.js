import { assertImportMap } from "../assertImportMap.js"
import { assertUrlLike } from "../assertUrlLike.js"

export const applyImportMap = ({ importMap, href, importerHref }) => {
  assertImportMap(importMap)
  assertUrlLike(href, "href")
  if (importerHref) {
    assertUrlLike(importerHref, "importerHref")
  }

  const { scopes } = importMap
  if (scopes && importerHref) {
    const scopeKeyMatching = Object.keys(scopes).find((scopeKey) => {
      return scopeKey === importerHref || specifierIsPrefixOf(scopeKey, importerHref)
    })
    if (scopeKeyMatching) {
      const scopeValue = scopes[scopeKeyMatching]
      const remappingFromScopeImports = applyImports(href, scopeValue)
      if (remappingFromScopeImports !== null) {
        return remappingFromScopeImports
      }
    }
  }

  const { imports } = importMap
  if (imports) {
    const remappingFromImports = applyImports(href, imports)
    if (remappingFromImports !== null) {
      return remappingFromImports
    }
  }

  return href
}

const applyImports = (href, imports) => {
  const importKeyArray = Object.keys(imports)

  let i = 0
  while (i < importKeyArray.length) {
    const importKey = importKeyArray[i]
    i++
    if (importKey === href) {
      const importValue = imports[importKey]
      return importValue
    }
    if (specifierIsPrefixOf(importKey, href)) {
      const importValue = imports[importKey]
      const afterImportKey = href.slice(importKey.length)
      return importValue + afterImportKey
    }
  }

  return null
}

const specifierIsPrefixOf = (specifierHref, href) => {
  return specifierHref[specifierHref.length - 1] === "/" && href.startsWith(specifierHref)
}
