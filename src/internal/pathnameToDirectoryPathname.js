export const pathnameToDirectoryPathname = (pathname) => {
  const slashLastIndex = pathname.lastIndexOf("/")
  if (slashLastIndex === -1) return ""

  return pathname.slice(0, slashLastIndex)
}
