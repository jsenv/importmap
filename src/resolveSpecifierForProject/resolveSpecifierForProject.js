import { hrefToOrigin, hrefToPathname } from "@jsenv/href"
import { resolveSpecifier } from "../resolveSpecifier/resolveSpecifier.js"

export const resolveSpecifierForProject = (
  specifier,
  projectPathname,
  httpResolutionOrigin = "http://fake_origin_unlikely_to_collide.ext",
) => {
  const specifierHttpResolved = resolveSpecifier(specifier, httpResolutionOrigin)
  if (hrefToOrigin(specifierHttpResolved) === httpResolutionOrigin) {
    const specifierRelativePath = hrefToPathname(specifierHttpResolved)
    return `file://${projectPathname}${specifierRelativePath}`
  }
  return specifierHttpResolved
}
