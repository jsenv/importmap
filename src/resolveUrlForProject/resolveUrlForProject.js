import { hrefToOrigin, hrefToPathname } from "@jsenv/href"
import { resolveUrl } from "../resolveUrl/resolveUrl.js"

export const resolveUrlForProject = ({
  projectPathname,
  specifier,
  httpResolutionOrigin = "http://fake_origin_unlikely_to_collide.ext",
}) => {
  const specifierHttpResolved = resolveUrl(specifier, httpResolutionOrigin)
  if (hrefToOrigin(specifierHttpResolved) === httpResolutionOrigin) {
    const specifierRelativePath = hrefToPathname(specifierHttpResolved)
    return `file://${projectPathname}${specifierRelativePath}`
  }
  return specifierHttpResolved
}
