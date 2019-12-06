/**
 * wrapImportMap can be used to remap all your imports under a folder.
 *
 * It is used by jsenv to import from a compiled folder instead of source folder.
 *
 * wrapImportMap must preserve the import map order so that
 * applyImportMap can still match the most specific pattern first.
 *
 * Because order is directly connected to the pattern length
 * prefixing every pattern with something does not means we have to sort
 * the wrappedImportMap.
 *
 * However we must absolutely ensure if an import like '/' exists in imports
 * or scoped imports. It must remain the last when being prefixed.
 *
 */

import { assertImportMap } from "./internal/assertImportMap.js"
import { hasScheme } from "./internal/hasScheme.js"

export const wrapImportMap = (importMap, folderRelativeName, ensureInto = true) => {
  assertImportMap(importMap)
  if (typeof folderRelativeName !== "string") {
    throw new TypeError(formulateFolderRelativeNameMustBeAString({ folderRelativeName }))
  }

  const into = `/${folderRelativeName}/`
  const { imports, scopes } = importMap

  let importsForWrapping
  if (imports) {
    importsForWrapping = wrapTopLevelImports(imports, into)
  } else {
    importsForWrapping = {}
  }

  let scopesForWrapping
  if (scopes) {
    scopesForWrapping = wrapScopes(scopes, into)
  } else {
    scopesForWrapping = {}
  }

  if (ensureInto) {
    // ensure anything not directly remapped is remapped inside into
    importsForWrapping[into] = into
    importsForWrapping["/"] = into
    // and when already into, you stay inside
    scopesForWrapping[into] = { [into]: into }
  }

  return {
    imports: importsForWrapping,
    scopes: scopesForWrapping,
  }
}

const wrapScopes = (scopes, into) => {
  const scopesWrapped = {}

  Object.keys(scopes).forEach((scopeKey) => {
    const scopeValue = scopes[scopeKey]
    const scopeKeyWrapped = wrapAddress(scopeKey, into)

    const { importsWrapped, importsRemaining } = wrapImports(scopeValue, into)

    let scopeValueWrapped
    if (scopeHasLeadingSlashScopedRemapping(scopeValue, scopeKey)) {
      const leadingSlashSpecifier = `${into}${scopeKey.slice(1)}`
      scopeValueWrapped = {}
      // put everything except the leading slash remapping
      Object.keys(importsWrapped).forEach((importKeyWrapped) => {
        if (importKeyWrapped === leadingSlashSpecifier || importKeyWrapped === into) {
          return
        }
        scopeValueWrapped[importKeyWrapped] = importsWrapped[importKeyWrapped]
      })
      Object.keys(importsRemaining).forEach((importKey) => {
        if (importKey === scopeKey || importKey === "/") {
          return
        }
        scopeValueWrapped[importKey] = importsRemaining[importKey]
      })
      // now put leading slash remapping to ensure it comes last
      scopeValueWrapped[leadingSlashSpecifier] = leadingSlashSpecifier
      scopeValueWrapped[scopeKey] = leadingSlashSpecifier
      scopeValueWrapped[into] = leadingSlashSpecifier
      scopeValueWrapped["/"] = leadingSlashSpecifier
    } else {
      scopeValueWrapped = {
        ...importsWrapped,
        ...importsRemaining,
      }
    }

    scopesWrapped[scopeKeyWrapped] = scopeValueWrapped
    if (scopeKeyWrapped !== scopeKey) {
      scopesWrapped[scopeKey] = { ...scopeValueWrapped }
    }
  })

  return scopesWrapped
}

const scopeHasLeadingSlashScopedRemapping = (scopeImports, scopeKey) => {
  return (
    scopeKey in scopeImports &&
    scopeImports[scopeKey] === scopeKey &&
    "/" in scopeImports &&
    scopeImports["/"] === scopeKey
  )
}

const wrapImports = (imports, into) => {
  const importsWrapped = {}
  const importsRemaining = {}

  Object.keys(imports).forEach((importKey) => {
    const importValue = imports[importKey]
    const importKeyWrapped = wrapSpecifier(importKey, into)
    const importValueWrapped = wrapAddress(importValue, into)

    const keyChanged = importKeyWrapped !== importKey
    const valueChanged = importValueWrapped !== importValue
    if (keyChanged || valueChanged) {
      importsWrapped[importKeyWrapped] = importValueWrapped
    } else {
      importsRemaining[importKey] = importValue
    }
  })

  return {
    importsWrapped,
    importsRemaining,
  }
}

const wrapTopLevelImports = (imports, into) => {
  const { importsWrapped, importsRemaining } = wrapImports(imports, into)
  return {
    ...importsWrapped,
    ...importsRemaining,
  }
}

const wrapSpecifier = (specifier, into) => {
  if (specifier.startsWith("//")) {
    return specifier
  }

  if (specifier[0] === "/") {
    return `${into}${specifier.slice(1)}`
  }

  if (specifier.startsWith("./")) {
    return `./${into}${specifier.slice(2)}`
  }

  return specifier
}

const wrapAddress = (string, into) => {
  if (string.startsWith("//")) {
    return string
  }

  if (string[0] === "/") {
    return `${into}${string.slice(1)}`
  }

  if (string.startsWith("./")) {
    return `./${into}${string.slice(2)}`
  }

  if (string.startsWith("../")) {
    return string
  }

  if (hasScheme(string)) {
    return string
  }

  // bare
  return `${into}${string}`
}

const formulateFolderRelativeNameMustBeAString = ({
  folderRelativeName,
}) => `folderRelativeName must be a string.
--- folder relative name ---
${folderRelativeName}`
