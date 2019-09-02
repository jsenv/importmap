/**
 * DISCLAIMER:
 * For now you could not resolve to a different origin
 * because applyImportMap work only with pathname and not url.
 *
 * It means passing
 * {
 *   imports: {
 *     "foo": "https://example.com/node_modules/foo/index.js"
 *   }
 * }
 * is not supported
 *
 * I could convert https://github.com/WICG/import-maps/blob/93f94c6dfb268bde3009644b65580fb2fbb98fcf/reference-implementation/lib/resolver.js#L12
 * into import/export and use it directly.
 *
 *
 */

// directly target the files because this code
// will be executed either on node or browser
// and also we don't want to pull more code than necessary
// when this one gets bundled
import { hrefToPathname } from "@jsenv/href/src/hrefToPathname/hrefToPathname.js"
import { hrefToOrigin } from "@jsenv/href/src/hrefToOrigin/hrefToOrigin.js"
import { assertImportMap } from "../assertImportMap.js"

export const applyImportMap = ({ importMap, href, importerHref }) => {
  assertImportMap(importMap)
  if (typeof href !== "string") {
    throw new TypeError(`href must be a string, got ${href}`)
  }

  const { imports = {}, scopes = {} } = importMap

  if (importerHref) {
    if (typeof importerHref !== "string") {
      throw new TypeError(`importerHref must be a string, got ${importerHref}`)
    }

    const importerPathname = hrefToPathname(importerHref)
    // here instead or taking the first match
    // take the best match instead
    // check the importMap spec repo to find how
    // (bsically most char matching is a win)
    // (or just the longest scope)
    const matchingPathnamePattern = Object.keys(scopes).find((pathnameMatchPattern) =>
      match(importerPathname, pathnameMatchPattern),
    )

    if (matchingPathnamePattern) {
      const scopeImports = scopes[matchingPathnamePattern]

      const scopeRemapping = applyImports({
        href,
        imports: scopeImports,
        // scopePattern: matchingPathnamePattern,
      })
      if (scopeRemapping !== null) {
        return scopeRemapping
      }
    }
  }

  const topLevelimportRemapping = applyImports({ href, imports })
  if (topLevelimportRemapping !== null) {
    return topLevelimportRemapping
  }

  return href
}

const applyImports = ({ href, imports }) => {
  const modulePathname = hrefToPathname(href)
  const pathnamePatternArray = Object.keys(imports)

  let i = 0
  while (i < pathnamePatternArray.length) {
    const pathnamePattern = pathnamePatternArray[i]
    i++
    const matchResult = match(modulePathname, pathnamePattern)
    if (!matchResult) continue

    const { before, after } = matchResult
    const replacement = imports[pathnamePattern]

    if (replacement.startsWith("file://")) {
      return `${before}${replacement}${after}`
    }

    const moduleOrigin = hrefToOrigin(href)
    return `${moduleOrigin}${before}${replacement}${after}`
  }

  return null
}

const match = (pathname, pattern) => {
  const patternHasLeadingSlash = pattern[0] === "/"
  const patternHasTrailingSlash = pattern[pattern.length - 1] === "/"

  // pattern : '/foo/'
  if (patternHasLeadingSlash && patternHasTrailingSlash) {
    const index = pathname.indexOf(pattern)

    // pathname: '/fo/bar'
    // pathname: '/foobar'
    if (index === -1) return null

    // pathname: '/foo/bar'
    return { before: pathname.slice(0, index), after: pathname.slice(index + pattern.length) }
  }

  // pattern: '/foo'
  if (patternHasLeadingSlash && !patternHasTrailingSlash) {
    // pathname: '/fo', /foobar'
    if (pathname !== pattern) return null

    // pathname: '/foo'
    return { before: "", after: "" }
  }

  // pattern: 'foo/'
  if (!patternHasLeadingSlash && patternHasTrailingSlash) {
    const index = pathname.indexOf(`/${pattern}`)

    // pathname: '/fo/bar'
    if (index === -1) return null

    // pathname: '/bar/foo/file.js'
    if (index !== 0) return null

    // pathname: '/foo', '/foo/bar'
    return { before: "", after: pathname.slice(pattern.length + 1) }
  }

  // pattern 'foo'

  // pathname: '/fo', /foobar'
  if (pathname.slice(1) !== pattern) return null

  // pathname: '/foo'
  return { before: "", after: "" }
}
