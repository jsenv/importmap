import { assertImportMap } from "./internal/assertImportMap.js"
import { tryUrlResolution } from "./internal/tryUrlResolution.js"
import { resolveSpecifier } from "./resolveSpecifier.js"
import { sortImports, sortScopes } from "./sortImportMap.js"

export const normalizeImportMap = (importMap, baseUrl) => {
  assertImportMap(importMap)
  if (typeof baseUrl !== "string") {
    throw new TypeError(formulateBaseUrlMustBeAString({ baseUrl }))
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
        formulateAddressMustBeAString({
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
        formulateAdressResolutionFailed({
          address,
          baseUrl,
          specifier,
        }),
      )
      return
    }

    if (specifier.endsWith("/") && !addressUrl.endsWith("/")) {
      console.warn(
        formulateAddressUrlRequiresTrailingSlash({
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
        formulateScopeResolutionFailed({
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

const formulateBaseUrlMustBeAString = ({ baseUrl }) => `baseUrl must be a string.
--- base url ---
${baseUrl}`

const formulateAddressMustBeAString = ({ specifier, address }) => `Address must be a string.
--- address ---
${address}
--- specifier ---
${specifier}`

const formulateAdressResolutionFailed = ({
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

const formulateAddressUrlRequiresTrailingSlash = ({
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

const formulateScopeResolutionFailed = ({ scope, baseUrl }) => `Scope url resolution failed.
--- scope ---
${scope}
--- base url ---
${baseUrl}`
