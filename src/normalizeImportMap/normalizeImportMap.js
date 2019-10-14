import { assertImportMap } from "../assertImportMap.js"
import { hasScheme } from "../hasScheme.js"
import { hasFetchScheme } from "../hasFetchScheme.js"
import { resolveSpecifier } from "../resolveSpecifier/resolveSpecifier.js"
import { resolveUrl } from "../resolveUrl/resolveUrl.js"
import { sortImports, sortScopes } from "../sortImportMap/sortImportMap.js"

export const normalizeImportMap = (importMap, href) => {
  assertImportMap(importMap)
  if (typeof href !== "string") {
    throw new TypeError(`href must be a string, got ${href}`)
  }

  const { imports, scopes } = importMap

  return {
    imports: imports ? normalizeImports(imports, href) : undefined,
    scopes: scopes ? normalizeScopes(scopes, href) : undefined,
  }
}

const normalizeImports = (imports, url) => {
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

    const specifierResolved = resolveSpecifier(specifier, url)
    if (specifierResolved === null) {
      console.warn(
        writeSpecifierResolutionFailed({
          specifier,
          importer: url,
        }),
      )
      return
    }

    const addressUrl = tryUrlResolution(address, url)
    if (addressUrl === null) {
      console.warn(
        writeAdressResolutionFailed({
          address,
          url,
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

const normalizeScopes = (scopes, url) => {
  const scopesNormalized = {}
  Object.keys(scopes).forEach((scope) => {
    const scopeValue = scopes[scope]
    const scopeUrl = tryUrlResolution(scope, url)
    if (scopeUrl === null) {
      console.warn(
        writeScopeResolutionFailed({
          scope,
          url,
        }),
      )
      return
    }
    if (!hasFetchScheme(scopeUrl)) {
      console.warn(
        writeScopeUrlMustUseFetchScheme({
          scopeUrl,
          scope,
          url,
        }),
      )
      return
    }
    const scopeValueNormalized = normalizeImports(scopeValue, url)
    scopesNormalized[scopeUrl] = scopeValueNormalized
  })
  return sortScopes(scopesNormalized)
}

const tryUrlResolution = (string, url) => {
  const result = resolveUrl(string, url)
  return hasScheme(result) ? result : null
}

const writeSpecifierResolutionFailed = ({ specifier, importer }) => `Specifier resolution failed.
--- specifier ---
${specifier}
--- importer ---
${importer}`

const writeAddressMustBeAString = ({ specifier, address }) => `Address must be a string.
--- address ---
${address}
--- specifier ---
${specifier}`

const writeAdressResolutionFailed = ({ address, url, specifier }) => `Address url resolution failed.
--- address ---
${address}
--- url ---
${url}
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

const writeScopeResolutionFailed = ({ scope, url }) => `Scope url resolution failed.
--- scope ---
${scope}
--- url ---
${url}`

const writeScopeUrlMustUseFetchScheme = ({
  scopeUrl,
  scope,
  url,
}) => `Scope url must use a fetch scheme.
--- scope url ---
${scopeUrl}
--- scope ---
${scope}
--- url ---
${url}`
