import { isWindowsDriveLetter } from "./isWindowsDriveLetter.js"

// "https://domain.com/folder/file.js"
// "file:///folder/file.js"
// "chrome://folder/file.js"
export const isAbsoluteSpecifier = (specifier) => {
  // window drive letter could are not protocol yep
  // something like `C:/folder/file.js`
  // will be considered as a bare import

  if (isWindowsDriveLetter(specifier.slice(0, 3))) return false
  return /^[a-zA-Z]+:/.test(specifier)
}

export const resolveAbsoluteSpecifier = (specifier) => specifier
