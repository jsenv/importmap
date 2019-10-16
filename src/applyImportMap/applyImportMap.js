import { assertImportMap } from "../assertImportMap.js"
import { hasScheme } from "../hasScheme.js"
import { tryUrlResolution } from "../tryUrlResolution.js"
import { resolveSpecifier } from "../resolveSpecifier/resolveSpecifier.js"

export const applyImportMap = ({ importMap, specifier, importer }) => {
  assertImportMap(importMap)
  if (typeof specifier !== "string") {
    throw new TypeError(writeSpecifierMustBeAString({ specifier, importer }))
  }
  if (importer) {
    if (typeof importer !== "string") {
      throw new TypeError(writeImporterMustBeAString({ importer, specifier }))
    }
    if (!hasScheme(importer)) {
      throw new Error(writeImporterMustBeAbsolute({ importer, specifier }))
    }
  }

  const specifierUrl = resolveSpecifier(specifier, importer)
  const specifierNormalized = specifierUrl || specifier

  const { scopes } = importMap
  if (scopes && importer) {
    const scopeKeyMatching = Object.keys(scopes).find((scopeKey) => {
      return scopeKey === importer || specifierIsPrefixOf(scopeKey, importer)
    })
    if (scopeKeyMatching) {
      const scopeValue = scopes[scopeKeyMatching]
      const remappingFromScopeImports = applyImports(specifierNormalized, scopeValue)
      if (remappingFromScopeImports !== null) {
        return remappingFromScopeImports
      }
    }
  }

  const { imports } = importMap
  if (imports) {
    const remappingFromImports = applyImports(specifierNormalized, imports)
    if (remappingFromImports !== null) {
      return remappingFromImports
    }
  }

  if (specifierUrl) {
    return specifierUrl
  }

  throw new Error(writeBareSpecifierMustBeRemapped({ specifier, importer }))
}

const applyImports = (specifier, imports) => {
  const importKeyArray = Object.keys(imports)

  let i = 0
  while (i < importKeyArray.length) {
    const importKey = importKeyArray[i]
    i++
    if (importKey === specifier) {
      const importValue = imports[importKey]
      return importValue
    }
    if (specifierIsPrefixOf(importKey, specifier)) {
      const importValue = imports[importKey]
      const afterImportKey = specifier.slice(importKey.length)

      return tryUrlResolution(afterImportKey, importValue)
    }
  }

  return null
}

const specifierIsPrefixOf = (specifierHref, href) => {
  return specifierHref[specifierHref.length - 1] === "/" && href.startsWith(specifierHref)
}

const writeSpecifierMustBeAString = ({ specifier, importer }) => `specifier must be a string.
--- specifier ---
${specifier}
--- importer ---
${importer}`

const writeImporterMustBeAString = ({ importer, specifier }) => `importer must be a string.
--- importer ---
${importer}
--- specifier ---
${specifier}`

const writeImporterMustBeAbsolute = ({ importer, specifier }) => `importer must be an absolute url.
--- importer ---
${importer}
--- specifier ---
${specifier}`

const writeBareSpecifierMustBeRemapped = ({ specifier, importer }) => `Unmapped bare specifier.
--- specifier ---
${specifier}
--- importer ---
${importer}`
