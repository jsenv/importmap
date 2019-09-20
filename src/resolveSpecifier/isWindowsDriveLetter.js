// https://url.spec.whatwg.org/#example-start-with-a-widows-drive-letter
export const isWindowsDriveLetter = (specifier) => {
  const firstChar = specifier[0]
  if (!/[a-zA-Z]/.test(firstChar)) return false
  const secondChar = specifier[1]
  if (secondChar !== ":") return false
  const thirdChar = specifier[2]
  return thirdChar === "/"
}
