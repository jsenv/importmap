const FETCH_SCHEMES = ["http", "https", "ftp", "about", "blob", "data", "file", "filesystem"]

export const hasFetchScheme = (string) => {
  return FETCH_SCHEMES.some((schemeCandidate) => string.startsWith(`${schemeCandidate}:`))
}
