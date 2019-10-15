import { assertImportMap } from "../assertImportMap.js"
import { tryUrlResolution } from "../tryUrlResolution.js"
import { resolveSpecifier } from "../resolveSpecifier/resolveSpecifier.js"

import { sortImports, sortScopes } from "../sortImportMap/sortImportMap.js"

export const normalizeImportMap = (importMap, baseUrl) => {
  assertImportMap(importMap)
  if (typeof baseUrl !== "string") {
    throw new TypeError(writeBaseUrlMustBeAString({ baseUrl }))
  }

  const { imports, scopes } = importMap

  return {
    imports: imports ? normalizeImports(imports, baseUrl) : undefined,
    scopes: scopes ? normalizeScopes(scopes, baseUrl) : undefined,
  }
}

const normalizeImports = (imports, baseUrl) => {
  const importsNormalized = {}
  Object.keys(imports).forEach((specifier) => {
    const address = imports[specifier]

    if (typeof address !== "string") {
      console.warn(
        writeAddressMustBeAString({
          address,
          specifier,
        }),
      )
      return
    }

    const specifierResolved = resolveSpecifier(specifier, baseUrl) || specifier

    const addressUrl = tryUrlResolution(address, baseUrl)
    if (addressUrl === null) {
      console.warn(
        writeAdressResolutionFailed({
          address,
          baseUrl,
          specifier,
        }),
      )
      return
    }

    if (specifier.endsWith("/") && !addressUrl.endsWith("/")) {
      console.warn(
        writeAddressUrlRequiresTrailingSlash({
          addressUrl,
          address,
          specifier,
        }),
      )
      return
    }
    importsNormalized[specifierResolved] = addressUrl
  })
  return sortImports(importsNormalized)
}

const normalizeScopes = (scopes, baseUrl) => {
  const scopesNormalized = {}
  Object.keys(scopes).forEach((scope) => {
    const scopeValue = scopes[scope]
    const scopeUrl = tryUrlResolution(scope, baseUrl)
    if (scopeUrl === null) {
      console.warn(
        writeScopeResolutionFailed({
          scope,
          baseUrl,
        }),
      )
      return
    }
    const scopeValueNormalized = normalizeImports(scopeValue, baseUrl)
    scopesNormalized[scopeUrl] = scopeValueNormalized
  })
  return sortScopes(scopesNormalized)
}

const writeBaseUrlMustBeAString = ({ baseUrl }) => `baseUrl must be a string.
--- base url ---
${baseUrl}`

const writeAddressMustBeAString = ({ specifier, address }) => `Address must be a string.
--- address ---
${address}
--- specifier ---
${specifier}`

const writeAdressResolutionFailed = ({
  address,
  baseUrl,
  specifier,
}) => `Address url resolution failed.
--- address ---
${address}
--- base url ---
${baseUrl}
--- specifier ---
${specifier}`

const writeAddressUrlRequiresTrailingSlash = ({
  addressURL,
  address,
  specifier,
}) => `Address must end with /.
--- address url ---
${addressURL}
--- address ---
${address}
--- specifier ---
${specifier}`

const writeScopeResolutionFailed = ({ scope, baseUrl }) => `Scope url resolution failed.
--- scope ---
${scope}
--- base url ---
${baseUrl}`
