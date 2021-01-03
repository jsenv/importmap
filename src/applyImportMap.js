import { createDetailedMessage } from "@jsenv/logger"
import { assertImportMap } from "./internal/assertImportMap.js"
import { hasScheme } from "./internal/hasScheme.js"
import { tryUrlResolution } from "./internal/tryUrlResolution.js"
import { resolveSpecifier } from "./resolveSpecifier.js"

export const applyImportMap = ({
  importMap,
  specifier,
  importer,
  createBareSpecifierError = ({ specifier, importer }) => {
    return new Error(createDetailedMessage(`Unmapped bare specifier.`, { specifier, importer }))
  },
}) => {
  assertImportMap(importMap)
  if (typeof specifier !== "string") {
    throw new TypeError(
      createDetailedMessage("specifier must be a string.", {
        specifier,
        importer,
      }),
    )
  }
  if (importer) {
    if (typeof importer !== "string") {
      throw new TypeError(
        createDetailedMessage("importer must be a string.", {
          importer,
          specifier,
        }),
      )
    }
    if (!hasScheme(importer)) {
      throw new Error(
        createDetailedMessage(`importer must be an absolute url.`, {
          importer,
          specifier,
        }),
      )
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

  throw new Error(createBareSpecifierError({ specifier, importer }))
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
