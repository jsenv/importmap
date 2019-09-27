import { normalizeImportMap } from "../normalizeImportMap/normalizeImportMap.js"

export const normalizeImportMapForProject = (
  importMap,
  httpResolutionOrigin = "http://fake_origin_unlikely_to_collide.ext",
) => {
  return normalizeImportMap(importMap, httpResolutionOrigin)
}
