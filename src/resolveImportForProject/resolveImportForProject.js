import { operatingSystemPathToPathname } from "@jsenv/operating-system-path"
import { hrefToOrigin, hrefToPathname, pathnameToRelativePath } from "@jsenv/href"
import { hasScheme } from "../hasScheme.js"
import { resolveUrl } from "../resolveUrl/resolveUrl.js"
import { resolveImport } from "../resolveImport/resolveImport.js"
import { escapeRegexpSpecialCharacters } from "./escapeRegexpSpecialCharacters.js"

export const resolveImportForProject = ({
  projectPath,
  specifier,
  importer = projectPathname,
  importMap = {},
  importDefaultExtension,
  httpResolutionForcing = true,
  httpResolutionOrigin = "http://fake_origin_unlikely_to_collide.ext",
  insideProjectForcing = true,
}) => {
  if (typeof projectPath !== "string") {
    throw new TypeError(`projectPath must be a string, got ${projectPath}`)
  }

  if (importer && !hasScheme(importer)) {
    throw new Error(`importer must have a scheme, got ${importer}`)
  }

  const projectPathname = operatingSystemPathToPathname(projectPath)
  const projectHref = `file://${projectPathname}`
  const importerHref = importer || projectHref

  if (
    insideProjectForcing &&
    importer !== projectHref &&
    hrefUseFileProtocol(importerHref) &&
    !importerHref.startsWith(`${projectHref}/`)
  ) {
    throw new Error(
      formulateImporterMustBeInsideProject({
        projectPath,
        importer,
      }),
    )
  }

  let importerForProject
  if (httpResolutionForcing) {
    if (importerHref === projectHref) {
      importerForProject = `${httpResolutionOrigin}`
    } else if (importerHref.startsWith(`${projectHref}/`)) {
      const importerPathname = hrefToPathname(importerHref)
      const importerRelativePath = pathnameToRelativePath(importerPathname, projectPathname)
      // 99% of the time importer is an operating system path
      // here we ensure / is resolved against project by forcing an url resolution
      // prefixing with origin
      importerForProject = `${httpResolutionOrigin}${importerRelativePath}`
    } else {
      // there is already a scheme (http, https, file), keep it
      // it means there is an absolute import starting with file:// or http:// for instance.
      importerForProject = importerHref
    }
  } else {
    importerForProject = importerHref
  }

  if (hrefUseFileProtocol(importer)) {
    const url = resolveUrl(specifier, importer)

    if (hrefUseFileProtocol(url)) {
      const isOutsideProject = url !== projectHref && !url.startsWith(`${projectHref}/`)

      if (isOutsideProject) {
        if (insideProjectForcing) {
          throw new Error(
            formulateImportMustBeInsideProject({
              projectPath,
              specifier,
              importer,
              importUrl: url,
            }),
          )
        }

        return url
      }
    }
  }

  let importUrl
  try {
    importUrl = resolveImport({
      specifier,
      importer: importerForProject,
      importMap,
      defaultExtension: importDefaultExtension,
    })
  } catch (e) {
    const httpResolutionOriginRegExp = new RegExp(
      escapeRegexpSpecialCharacters(httpResolutionOrigin),
      "g",
    )
    const projectOrigin = `file://${projectPathname}`
    e.stack = e.stack.replace(httpResolutionOriginRegExp, projectOrigin)
    e.message = e.message.replace(httpResolutionOriginRegExp, projectOrigin)
    throw e
  }

  if (
    insideProjectForcing &&
    // only if use file protocol because
    // it's ok to have an external import like "https://cdn.com/jquery.js"
    hrefUseFileProtocol(importUrl) &&
    importUrl !== projectHref &&
    !importUrl.startsWith(`${projectHref}/`)
  ) {
    throw new Error(
      formulateImportMustBeInsideProject({
        projectPath,
        specifier,
        importer,
        importUrl,
      }),
    )
  }

  if (httpResolutionForcing && hrefToOrigin(importUrl) === httpResolutionOrigin) {
    const importRelativePath = hrefToPathname(importUrl)
    return `${projectHref}${importRelativePath}`
  }

  return importUrl
}

const hrefUseFileProtocol = (specifier) => specifier.startsWith("file://")

const formulateImporterMustBeInsideProject = ({
  projectPath,
  importer,
}) => `importer must be inside project.
--- importer ---
${importer}
--- project path ---
${projectPath}`

const formulateImportMustBeInsideProject = ({
  projectPath,
  specifier,
  importer,
  importUrl,
}) => `import must be inside project.
--- import url ---
${importUrl}
--- project path ---
${projectPath}
--- specifier ---
${specifier}
--- importer ---
${importer}`
