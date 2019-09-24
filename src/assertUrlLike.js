import { isAbsoluteSpecifier } from "./resolveSpecifier/absoluteSpecifier.js"

export const assertUrlLike = (value, name = "specifier") => {
  if (typeof value !== "string") {
    throw new TypeError(`${name} must be a string, got ${value}`)
  }
  if (!isAbsoluteSpecifier(value)) {
    throw new Error(`${name} must be a url and no scheme found, got ${value}`)
  }
}
