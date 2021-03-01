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
    const scopeSpecifierMatching = Object.keys(scopes).find((scopeSpecifier) => {
      return scopeSpecifier === importer || specifierIsPrefixOf(scopeSpecifier, importer)
    })
    if (scopeSpecifierMatching) {
      const scopeMappings = scopes[scopeSpecifierMatching]
      const mappingFromScopes = applyMappings(scopeMappings, specifierNormalized)
      if (mappingFromScopes !== null) {
        return mappingFromScopes
      }
    }
  }

  const { imports } = importMap
  if (imports) {
    const mappingFromImports = applyMappings(imports, specifierNormalized)
    if (mappingFromImports !== null) {
      return mappingFromImports
    }
  }

  if (specifierUrl) {
    return specifierUrl
  }

  throw new Error(createBareSpecifierError({ specifier, importer }))
}

const applyMappings = (mappings, specifier) => {
  const specifierCandidates = Object.keys(mappings)

  let i = 0
  while (i < specifierCandidates.length) {
    const specifierCandidate = specifierCandidates[i]
    i++
    if (specifierCandidate === specifier) {
      const address = mappings[specifierCandidate]
      return address
    }
    if (specifierIsPrefixOf(specifierCandidate, specifier)) {
      const address = mappings[specifierCandidate]
      const afterSpecifier = specifier.slice(specifierCandidate.length)
      return tryUrlResolution(afterSpecifier, address)
    }
  }

  return null
}

const specifierIsPrefixOf = (specifierHref, href) => {
  return specifierHref[specifierHref.length - 1] === "/" && href.startsWith(specifierHref)
}
