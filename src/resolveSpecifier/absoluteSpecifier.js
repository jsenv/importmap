// "https://domain.com/folder/file.js"
// "file:///folder/file.js"
// "chrome://folder/file.js"
export const isAbsoluteSpecifier = (specifier) => {
  if (isWindowsDriveSpecifier(specifier)) {
    // window drive letter could are not protocol yep
    // something like `C:/folder/file.js`
    // will be considered as a bare import
    return false
  }
  return /^[a-zA-Z]+:/.test(specifier)
}

// https://url.spec.whatwg.org/#example-start-with-a-widows-drive-letter
const isWindowsDriveSpecifier = (specifier) => {
  const firstChar = specifier[0]
  if (!/[a-zA-Z]/.test(firstChar)) return false
  const secondChar = specifier[1]
  if (secondChar !== ":") return false
  const thirdChar = specifier[2]
  return thirdChar === "/"
}

export const resolveAbsoluteSpecifier = (specifier) => specifier
