import { hasScheme } from "./hasScheme.js"
import { resolveUrl } from "./resolveUrl/resolveUrl.js"

export const tryUrlResolution = (string, url) => {
  const result = resolveUrl(string, url)
  return hasScheme(result) ? result : null
}
