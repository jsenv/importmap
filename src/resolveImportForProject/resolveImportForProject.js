import { pathnameToOperatingSystemPath } from "@jsenv/operating-system-path"
import { hrefToOrigin, hrefToPathname, pathnameToRelativePath } from "@jsenv/href"
import { resolveImport } from "../resolveImport/resolveImport.js"

export const resolveImportForProject = ({
  projectPathname,
  specifier,
  importer = projectPathname,
  importMap,
  importDefaultExtension,
  httpResolutionForcing = true,
  httpResolutionOrigin = "http://fake_origin_unlikely_to_collide.ext",
  insideProjectForcing = true,
}) => {
  if (typeof projectPathname !== "string") {
    throw new TypeError(`projectPathname must be a string, got ${projectPathname}`)
  }

  const projectHref = `file://${projectPathname}`
  const importerHref = importer || projectHref

  if (
    insideProjectForcing &&
    importer !== projectHref &&
    hrefUseFileProtocol(importerHref) &&
    !importerHref.startsWith(`${projectHref}/`)
  ) {
    throw new Error(
      createImporterMustBeInsideProjectMessage({
        projectPathname,
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

  const importResolved = resolveImport({
    specifier,
    importer: importerForProject,
    importMap,
    defaultExtension: importDefaultExtension,
  })

  if (
    insideProjectForcing &&
    // only if use file protocol because
    // it's ok to have an external import like "https://cdn.com/jquery.js"
    hrefUseFileProtocol(importResolved) &&
    importResolved !== projectHref &&
    !importResolved.startsWith(`${projectHref}/`)
  ) {
    throw new Error(
      createImportMustBeInsideProjectMessage({
        projectPathname,
        specifier,
        importer,
        importResolved,
      }),
    )
  }

  if (httpResolutionForcing && hrefToOrigin(importResolved) === httpResolutionOrigin) {
    const importRelativePath = hrefToPathname(importResolved)
    return `${projectHref}${importRelativePath}`
  }

  return importResolved
}

const hrefUseFileProtocol = (specifier) => specifier.startsWith("file://")

const createImporterMustBeInsideProjectMessage = ({
  projectPathname,
  importer,
}) => `importer must be inside project.
  --- importer ---
  ${importer}
  --- project ---
  ${pathnameToOperatingSystemPath(projectPathname)}`

const createImportMustBeInsideProjectMessage = ({
  projectPathname,
  specifier,
  importer,
  importResolved,
}) => `import must be inside project.
--- specifier ---
${specifier}
--- importer ---
${importer}
--- resolved import ---
${importResolved}
--- project path ---
${pathnameToOperatingSystemPath(projectPathname)}`
