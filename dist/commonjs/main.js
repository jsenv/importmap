'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const assertImportMap = value => {
  if (value === null) {
    throw new TypeError(`an importMap must be an object, got null`);
  }

  const type = typeof value;

  if (type !== "object") {
    throw new TypeError(`an importMap must be an object, received ${value}`);
  }

  if (Array.isArray(value)) {
    throw new TypeError(`an importMap must be an object, received array ${value}`);
  }
};

const hasScheme = string => {
  return /^[a-zA-Z]{2,}:/.test(string);
};

const hrefToScheme = href => {
  const colonIndex = href.indexOf(":");
  if (colonIndex === -1) return "";
  return href.slice(0, colonIndex);
};

const hrefToPathname = href => {
  return ressourceToPathname(hrefToRessource(href));
};

const hrefToRessource = href => {
  const scheme = hrefToScheme(href);

  if (scheme === "file") {
    return href.slice("file://".length);
  }

  if (scheme === "https" || scheme === "http") {
    // remove origin
    const afterProtocol = href.slice(scheme.length + "://".length);
    const pathnameSlashIndex = afterProtocol.indexOf("/", "://".length);
    return afterProtocol.slice(pathnameSlashIndex);
  }

  return href.slice(scheme.length + 1);
};

const ressourceToPathname = ressource => {
  const searchSeparatorIndex = ressource.indexOf("?");
  return searchSeparatorIndex === -1 ? ressource : ressource.slice(0, searchSeparatorIndex);
};

const hrefToOrigin = href => {
  const scheme = hrefToScheme(href);

  if (scheme === "file") {
    return "file://";
  }

  if (scheme === "http" || scheme === "https") {
    const secondProtocolSlashIndex = scheme.length + "://".length;
    const pathnameSlashIndex = href.indexOf("/", secondProtocolSlashIndex);
    if (pathnameSlashIndex === -1) return href;
    return href.slice(0, pathnameSlashIndex);
  }

  return href.slice(0, scheme.length + 1);
};

const pathnameToDirname = pathname => {
  const slashLastIndex = pathname.lastIndexOf("/");
  if (slashLastIndex === -1) return "";
  return pathname.slice(0, slashLastIndex);
};

// could be useful: https://url.spec.whatwg.org/#url-miscellaneous
const resolveUrl = (specifier, baseUrl) => {
  if (baseUrl) {
    if (typeof baseUrl !== "string") {
      throw new TypeError(writeBaseUrlMustBeAString({
        baseUrl,
        specifier
      }));
    }

    if (!hasScheme(baseUrl)) {
      throw new Error(writeBaseUrlMustBeAbsolute({
        baseUrl,
        specifier
      }));
    }
  }

  if (hasScheme(specifier)) {
    return specifier;
  }

  if (!baseUrl) {
    throw new Error(writeBaseUrlRequired({
      baseUrl,
      specifier
    }));
  } // scheme relative


  if (specifier.slice(0, 2) === "//") {
    return `${hrefToScheme(baseUrl)}:${specifier}`;
  } // origin relative


  if (specifier[0] === "/") {
    return `${hrefToOrigin(baseUrl)}${specifier}`;
  }

  const baseOrigin = hrefToOrigin(baseUrl);
  const basePathname = hrefToPathname(baseUrl);

  if (specifier === ".") {
    const baseDirname = pathnameToDirname(basePathname);
    return `${baseOrigin}${baseDirname}/`;
  } // pathname relative inside


  if (specifier.slice(0, 2) === "./") {
    const baseDirname = pathnameToDirname(basePathname);
    return `${baseOrigin}${baseDirname}/${specifier.slice(2)}`;
  } // pathname relative outside


  if (specifier.slice(0, 3) === "../") {
    let unresolvedPathname = specifier;
    const importerFolders = basePathname.split("/");
    importerFolders.pop();

    while (unresolvedPathname.slice(0, 3) === "../") {
      unresolvedPathname = unresolvedPathname.slice(3); // when there is no folder left to resolved
      // we just ignore '../'

      if (importerFolders.length) {
        importerFolders.pop();
      }
    }

    const resolvedPathname = `${importerFolders.join("/")}/${unresolvedPathname}`;
    return `${baseOrigin}${resolvedPathname}`;
  } // bare


  if (basePathname === "") {
    return `${baseOrigin}/${specifier}`;
  }

  if (basePathname[basePathname.length] === "/") {
    return `${baseOrigin}${basePathname}${specifier}`;
  }

  return `${baseOrigin}${pathnameToDirname(basePathname)}/${specifier}`;
};

const writeBaseUrlMustBeAString = ({
  baseUrl,
  specifier
}) => `baseUrl must be a string.
--- base url ---
${baseUrl}
--- specifier ---
${specifier}`;

const writeBaseUrlMustBeAbsolute = ({
  baseUrl,
  specifier
}) => `baseUrl must be absolute.
--- base url ---
${baseUrl}
--- specifier ---
${specifier}`;

const writeBaseUrlRequired = ({
  baseUrl,
  specifier
}) => `baseUrl required to resolve relative specifier.
--- base url ---
${baseUrl}
--- specifier ---
${specifier}`;

const tryUrlResolution = (string, url) => {
  const result = resolveUrl(string, url);
  return hasScheme(result) ? result : null;
};

const resolveSpecifier = (specifier, importer) => {
  if (specifier[0] === "/" || specifier.startsWith("./") || specifier.startsWith("../")) {
    return resolveUrl(specifier, importer);
  }

  if (hasScheme(specifier)) {
    return specifier;
  }

  return null;
};

const applyImportMap = ({
  importMap,
  specifier,
  importer
}) => {
  assertImportMap(importMap);

  if (typeof specifier !== "string") {
    throw new TypeError(writeSpecifierMustBeAString({
      specifier,
      importer
    }));
  }

  if (importer) {
    if (typeof importer !== "string") {
      throw new TypeError(writeImporterMustBeAString({
        importer,
        specifier
      }));
    }

    if (!hasScheme(importer)) {
      throw new Error(writeImporterMustBeAbsolute({
        importer,
        specifier
      }));
    }
  }

  const specifierUrl = resolveSpecifier(specifier, importer);
  const specifierNormalized = specifierUrl || specifier;
  const {
    scopes
  } = importMap;

  if (scopes && importer) {
    const scopeKeyMatching = Object.keys(scopes).find(scopeKey => {
      return scopeKey === importer || specifierIsPrefixOf(scopeKey, importer);
    });

    if (scopeKeyMatching) {
      const scopeValue = scopes[scopeKeyMatching];
      const remappingFromScopeImports = applyImports(specifierNormalized, scopeValue);

      if (remappingFromScopeImports !== null) {
        return remappingFromScopeImports;
      }
    }
  }

  const {
    imports
  } = importMap;

  if (imports) {
    const remappingFromImports = applyImports(specifierNormalized, imports);

    if (remappingFromImports !== null) {
      return remappingFromImports;
    }
  }

  if (specifierUrl) {
    return specifierUrl;
  }

  throw new Error(writeBareSpecifierMustBeRemapped({
    specifier,
    importer
  }));
};

const applyImports = (specifier, imports) => {
  const importKeyArray = Object.keys(imports);
  let i = 0;

  while (i < importKeyArray.length) {
    const importKey = importKeyArray[i];
    i++;

    if (importKey === specifier) {
      const importValue = imports[importKey];
      return importValue;
    }

    if (specifierIsPrefixOf(importKey, specifier)) {
      const importValue = imports[importKey];
      const afterImportKey = specifier.slice(importKey.length);
      return tryUrlResolution(afterImportKey, importValue);
    }
  }

  return null;
};

const specifierIsPrefixOf = (specifierHref, href) => {
  return specifierHref[specifierHref.length - 1] === "/" && href.startsWith(specifierHref);
};

const writeSpecifierMustBeAString = ({
  specifier,
  importer
}) => `specifier must be a string.
--- specifier ---
${specifier}
--- importer ---
${importer}`;

const writeImporterMustBeAString = ({
  importer,
  specifier
}) => `importer must be a string.
--- importer ---
${importer}
--- specifier ---
${specifier}`;

const writeImporterMustBeAbsolute = ({
  importer,
  specifier
}) => `importer must be an absolute url.
--- importer ---
${importer}
--- specifier ---
${specifier}`;

const writeBareSpecifierMustBeRemapped = ({
  specifier,
  importer
}) => `Unmapped bare specifier.
--- specifier ---
${specifier}
--- importer ---
${importer}`;

// https://github.com/systemjs/systemjs/blob/89391f92dfeac33919b0223bbf834a1f4eea5750/src/common.js#L136
const composeTwoImportMaps = (leftImportMap, rightImportMap) => {
  assertImportMap(leftImportMap);
  assertImportMap(rightImportMap);
  return {
    imports: composeTwoImports(leftImportMap.imports, rightImportMap.imports),
    scopes: composeTwoScopes(leftImportMap.scopes, rightImportMap.scopes)
  };
};

const composeTwoImports = (leftImports = {}, rightImports = {}) => {
  return { ...leftImports,
    ...rightImports
  };
};

const composeTwoScopes = (leftScopes = {}, rightScopes = {}) => {
  const scopes = { ...leftScopes
  };
  Object.keys(rightScopes).forEach(scopeKey => {
    if (scopes.hasOwnProperty(scopeKey)) {
      scopes[scopeKey] = { ...scopes[scopeKey],
        ...rightScopes[scopeKey]
      };
    } else {
      scopes[scopeKey] = { ...rightScopes[scopeKey]
      };
    }
  });
  return scopes;
};

const sortImportMap = importMap => {
  assertImportMap(importMap);
  const {
    imports,
    scopes
  } = importMap;
  return {
    imports: imports ? sortImports(imports) : undefined,
    scopes: scopes ? sortScopes(scopes) : undefined
  };
};
const sortImports = imports => {
  const importsSorted = {};
  Object.keys(imports).sort(compareLengthOrLocaleCompare).forEach(name => {
    importsSorted[name] = imports[name];
  });
  return importsSorted;
};
const sortScopes = scopes => {
  const scopesSorted = {};
  Object.keys(scopes).sort(compareLengthOrLocaleCompare).forEach(scopeName => {
    scopesSorted[scopeName] = sortImports(scopes[scopeName]);
  });
  return scopesSorted;
};

const compareLengthOrLocaleCompare = (a, b) => {
  return b.length - a.length || a.localeCompare(b);
};

const normalizeImportMap = (importMap, baseUrl) => {
  assertImportMap(importMap);

  if (typeof baseUrl !== "string") {
    throw new TypeError(formulateBaseUrlMustBeAString({
      baseUrl
    }));
  }

  const {
    imports,
    scopes
  } = importMap;
  return {
    imports: imports ? normalizeImports(imports, baseUrl) : undefined,
    scopes: scopes ? normalizeScopes(scopes, baseUrl) : undefined
  };
};

const normalizeImports = (imports, baseUrl) => {
  const importsNormalized = {};
  Object.keys(imports).forEach(specifier => {
    const address = imports[specifier];

    if (typeof address !== "string") {
      console.warn(formulateAddressMustBeAString({
        address,
        specifier
      }));
      return;
    }

    const specifierResolved = resolveSpecifier(specifier, baseUrl) || specifier;
    const addressUrl = tryUrlResolution(address, baseUrl);

    if (addressUrl === null) {
      console.warn(formulateAdressResolutionFailed({
        address,
        baseUrl,
        specifier
      }));
      return;
    }

    if (specifier.endsWith("/") && !addressUrl.endsWith("/")) {
      console.warn(formulateAddressUrlRequiresTrailingSlash({
        addressUrl,
        address,
        specifier
      }));
      return;
    }

    importsNormalized[specifierResolved] = addressUrl;
  });
  return sortImports(importsNormalized);
};

const normalizeScopes = (scopes, baseUrl) => {
  const scopesNormalized = {};
  Object.keys(scopes).forEach(scope => {
    const scopeValue = scopes[scope];
    const scopeUrl = tryUrlResolution(scope, baseUrl);

    if (scopeUrl === null) {
      console.warn(formulateScopeResolutionFailed({
        scope,
        baseUrl
      }));
      return;
    }

    const scopeValueNormalized = normalizeImports(scopeValue, baseUrl);
    scopesNormalized[scopeUrl] = scopeValueNormalized;
  });
  return sortScopes(scopesNormalized);
};

const formulateBaseUrlMustBeAString = ({
  baseUrl
}) => `baseUrl must be a string.
--- base url ---
${baseUrl}`;

const formulateAddressMustBeAString = ({
  specifier,
  address
}) => `Address must be a string.
--- address ---
${address}
--- specifier ---
${specifier}`;

const formulateAdressResolutionFailed = ({
  address,
  baseUrl,
  specifier
}) => `Address url resolution failed.
--- address ---
${address}
--- base url ---
${baseUrl}
--- specifier ---
${specifier}`;

const formulateAddressUrlRequiresTrailingSlash = ({
  addressURL,
  address,
  specifier
}) => `Address must end with /.
--- address url ---
${addressURL}
--- address ---
${address}
--- specifier ---
${specifier}`;

const formulateScopeResolutionFailed = ({
  scope,
  baseUrl
}) => `Scope url resolution failed.
--- scope ---
${scope}
--- base url ---
${baseUrl}`;

const normalizeImportMapForProject = (importMap, httpResolutionOrigin = "http://fake_origin_unlikely_to_collide.ext") => {
  return normalizeImportMap(importMap, httpResolutionOrigin);
};

const pathnameToExtension = pathname => {
  const slashLastIndex = pathname.lastIndexOf("/");

  if (slashLastIndex !== -1) {
    pathname = pathname.slice(slashLastIndex + 1);
  }

  const dotLastIndex = pathname.lastIndexOf(".");
  if (dotLastIndex === -1) return ""; // if (dotLastIndex === pathname.length - 1) return ""

  return pathname.slice(dotLastIndex);
};

// directly target the files because this code
const resolveImport = ({
  specifier,
  importer,
  importMap,
  defaultExtension = true
}) => {
  return applyDefaultExtension({
    url: importMap ? applyImportMap({
      importMap,
      specifier,
      importer
    }) : resolveUrl(specifier, importer),
    importer,
    defaultExtension
  });
};

const applyDefaultExtension = ({
  url,
  importer,
  defaultExtension
}) => {
  if (hrefToPathname(url) === "/") {
    return url;
  }

  if (url.endsWith("/")) {
    return url;
  }

  if (typeof defaultExtension === "string") {
    const extension = pathnameToExtension(url);

    if (extension === "") {
      return `${url}${defaultExtension}`;
    }

    return url;
  }

  if (defaultExtension === true) {
    const extension = pathnameToExtension(url);

    if (extension === "" && importer) {
      const importerPathname = hrefToPathname(importer);
      const importerExtension = pathnameToExtension(importerPathname);
      return `${url}${importerExtension}`;
    }
  }

  return url;
};

const startsWithWindowsDriveLetter = string => {
  const firstChar = string[0];
  if (!/[a-zA-Z]/.test(firstChar)) return false;
  const secondChar = string[1];
  if (secondChar !== ":") return false;
  return true;
};

const replaceSlashesWithBackSlashes = string => string.replace(/\//g, "\\");

const pathnameToOperatingSystemPath = pathname => {
  if (pathname[0] !== "/") throw new Error(`pathname must start with /, got ${pathname}`);
  const pathnameWithoutLeadingSlash = pathname.slice(1);

  if (startsWithWindowsDriveLetter(pathnameWithoutLeadingSlash) && pathnameWithoutLeadingSlash[2] === "/") {
    return replaceSlashesWithBackSlashes(pathnameWithoutLeadingSlash);
  } // linux mac pathname === operatingSystemFilename


  return pathname;
};

const pathnameToRelativePath = (pathname, otherPathname) => pathname.slice(otherPathname.length);

const resolveImportForProject = ({
  projectPathname,
  specifier,
  importer = projectPathname,
  importMap,
  importDefaultExtension,
  httpResolutionForcing = true,
  httpResolutionOrigin = "http://fake_origin_unlikely_to_collide.ext",
  insideProjectForcing = true
}) => {
  if (typeof projectPathname !== "string") {
    throw new TypeError(`projectPathname must be a string, got ${projectPathname}`);
  }

  const projectHref = `file://${projectPathname}`;
  const importerHref = importer || projectHref;

  if (insideProjectForcing && importer !== projectHref && hrefUseFileProtocol(importerHref) && !importerHref.startsWith(`${projectHref}/`)) {
    throw new Error(formulateImporterMustBeInsideProject({
      projectPathname,
      importer
    }));
  }

  let importerForProject;

  if (httpResolutionForcing) {
    if (importerHref === projectHref) {
      importerForProject = `${httpResolutionOrigin}`;
    } else if (importerHref.startsWith(`${projectHref}/`)) {
      const importerPathname = hrefToPathname(importerHref);
      const importerRelativePath = pathnameToRelativePath(importerPathname, projectPathname); // 99% of the time importer is an operating system path
      // here we ensure / is resolved against project by forcing an url resolution
      // prefixing with origin

      importerForProject = `${httpResolutionOrigin}${importerRelativePath}`;
    } else {
      // there is already a scheme (http, https, file), keep it
      // it means there is an absolute import starting with file:// or http:// for instance.
      importerForProject = importerHref;
    }
  } else {
    importerForProject = importerHref;
  }

  let importResolved;

  try {
    importResolved = resolveImport({
      specifier,
      importer: importerForProject,
      importMap,
      defaultExtension: importDefaultExtension
    });
  } catch (e) {
    if (e.message.startsWith("Unmapped bare specifier")) {
      e.message = writeBareSpecifierMustBeRemapped({
        specifier,
        importer
      });
    }

    throw e;
  }

  if (insideProjectForcing && // only if use file protocol because
  // it's ok to have an external import like "https://cdn.com/jquery.js"
  hrefUseFileProtocol(importResolved) && importResolved !== projectHref && !importResolved.startsWith(`${projectHref}/`)) {
    throw new Error(formulateImportMustBeInsideProject({
      projectPathname,
      specifier,
      importer,
      importResolved
    }));
  }

  if (httpResolutionForcing && hrefToOrigin(importResolved) === httpResolutionOrigin) {
    const importRelativePath = hrefToPathname(importResolved);
    return `${projectHref}${importRelativePath}`;
  }

  return importResolved;
};

const hrefUseFileProtocol = specifier => specifier.startsWith("file://");

const formulateImporterMustBeInsideProject = ({
  projectPathname,
  importer
}) => `importer must be inside project.
--- importer ---
${importer}
--- project ---
${pathnameToOperatingSystemPath(projectPathname)}`;

const formulateImportMustBeInsideProject = ({
  projectPathname,
  specifier,
  importer,
  importResolved
}) => `import must be inside project.
--- specifier ---
${specifier}
--- importer ---
${importer}
--- resolved import ---
${importResolved}
--- project path ---
${pathnameToOperatingSystemPath(projectPathname)}`;

const resolveSpecifierForProject = (specifier, projectPathname, httpResolutionOrigin = "http://fake_origin_unlikely_to_collide.ext") => {
  const specifierHttpResolved = resolveSpecifier(specifier, httpResolutionOrigin);

  if (hrefToOrigin(specifierHttpResolved) === httpResolutionOrigin) {
    const specifierRelativePath = hrefToPathname(specifierHttpResolved);
    return `file://${projectPathname}${specifierRelativePath}`;
  }

  return specifierHttpResolved;
};

/**
 * wrapImportMap can be used to remap all your imports under a folder.
 *
 * It is used by jsenv to import from a compiled folder instead of source folder.
 *
 * wrapImportMap must preserve the import map order so that
 * applyImportMap can still match the most specific pattern first.
 *
 * Because order is directly connected to the pattern length
 * prefixing every pattern with something does not means we have to sort
 * the wrappedImportMap.
 *
 * However we must absolutely ensure if an import like '/' exists in imports
 * or scoped imports. It must remain the last when being prefixed.
 *
 */
const wrapImportMap = (importMap, folderRelativeName, ensureInto = true) => {
  assertImportMap(importMap);

  if (typeof folderRelativeName !== "string") {
    throw new TypeError(formulateFolderRelativeNameMustBeAString({
      folderRelativeName
    }));
  }

  const into = `/${folderRelativeName}/`;
  const {
    imports,
    scopes
  } = importMap;
  let importsForWrapping;

  if (imports) {
    importsForWrapping = wrapTopLevelImports(imports, into);
  } else {
    importsForWrapping = {};
  }

  let scopesForWrapping;

  if (scopes) {
    scopesForWrapping = wrapScopes(scopes, into);
  } else {
    scopesForWrapping = {};
  }

  if (ensureInto) {
    // ensure anything not directly remapped is remapped inside into
    importsForWrapping[into] = into;
    importsForWrapping["/"] = into; // and when already into, you stay inside

    scopesForWrapping[into] = {
      [into]: into
    };
  }

  return {
    imports: importsForWrapping,
    scopes: scopesForWrapping
  };
};

const wrapScopes = (scopes, into) => {
  const scopesWrapped = {};
  Object.keys(scopes).forEach(scopeKey => {
    const scopeValue = scopes[scopeKey];
    const scopeKeyWrapped = wrapAddress(scopeKey, into);
    const {
      importsWrapped,
      importsRemaining
    } = wrapImports(scopeValue, into);
    let scopeValueWrapped;

    if (scopeHasLeadingSlashScopedRemapping(scopeValue, scopeKey)) {
      const leadingSlashSpecifier = `${into}${scopeKey.slice(1)}`;
      scopeValueWrapped = {}; // put everything except the leading slash remapping

      Object.keys(importsWrapped).forEach(importKeyWrapped => {
        if (importKeyWrapped === leadingSlashSpecifier || importKeyWrapped === into) {
          return;
        }

        scopeValueWrapped[importKeyWrapped] = importsWrapped[importKeyWrapped];
      });
      Object.keys(importsRemaining).forEach(importKey => {
        if (importKey === scopeKey || importKey === "/") {
          return;
        }

        scopeValueWrapped[importKey] = importsRemaining[importKey];
      }); // now put leading slash remapping to ensure it comes last

      scopeValueWrapped[leadingSlashSpecifier] = leadingSlashSpecifier;
      scopeValueWrapped[scopeKey] = leadingSlashSpecifier;
      scopeValueWrapped[into] = leadingSlashSpecifier;
      scopeValueWrapped["/"] = leadingSlashSpecifier;
    } else {
      scopeValueWrapped = { ...importsWrapped,
        ...importsRemaining
      };
    }

    scopesWrapped[scopeKeyWrapped] = scopeValueWrapped;

    if (scopeKeyWrapped !== scopeKey) {
      scopesWrapped[scopeKey] = { ...scopeValueWrapped
      };
    }
  });
  return scopesWrapped;
};

const scopeHasLeadingSlashScopedRemapping = (scopeImports, scopeKey) => {
  return scopeKey in scopeImports && scopeImports[scopeKey] === scopeKey && "/" in scopeImports && scopeImports["/"] === scopeKey;
};

const wrapImports = (imports, into) => {
  const importsWrapped = {};
  const importsRemaining = {};
  Object.keys(imports).forEach(importKey => {
    const importValue = imports[importKey];
    const importKeyWrapped = wrapSpecifier(importKey, into);
    const importValueWrapped = wrapAddress(importValue, into);
    const keyChanged = importKeyWrapped !== importKey;
    const valueChanged = importValueWrapped !== importValue;

    if (keyChanged || valueChanged) {
      importsWrapped[importKeyWrapped] = importValueWrapped;
    } else {
      importsRemaining[importKey] = importValue;
    }
  });
  return {
    importsWrapped,
    importsRemaining
  };
};

const wrapTopLevelImports = (imports, into) => {
  const {
    importsWrapped,
    importsRemaining
  } = wrapImports(imports, into);
  return { ...importsWrapped,
    ...importsRemaining
  };
};

const wrapSpecifier = (specifier, into) => {
  if (specifier.startsWith("//")) {
    return specifier;
  }

  if (specifier[0] === "/") {
    return `${into}${specifier.slice(1)}`;
  }

  if (specifier.startsWith("./")) {
    return `./${into}${specifier.slice(2)}`;
  }

  return specifier;
};

const wrapAddress = (string, into) => {
  if (string.startsWith("//")) {
    return string;
  }

  if (string[0] === "/") {
    return `${into}${string.slice(1)}`;
  }

  if (string.startsWith("./")) {
    return `./${into}${string.slice(2)}`;
  }

  if (string.startsWith("../")) {
    return string;
  }

  if (hasScheme(string)) {
    return string;
  } // bare


  return `${into}${string}`;
};

const formulateFolderRelativeNameMustBeAString = ({
  folderRelativeName
}) => `folderRelativeName must be a string.
--- folder relative name ---
${folderRelativeName}`;

exports.applyImportMap = applyImportMap;
exports.composeTwoImportMaps = composeTwoImportMaps;
exports.normalizeImportMap = normalizeImportMap;
exports.normalizeImportMapForProject = normalizeImportMapForProject;
exports.resolveImport = resolveImport;
exports.resolveImportForProject = resolveImportForProject;
exports.resolveSpecifier = resolveSpecifier;
exports.resolveSpecifierForProject = resolveSpecifierForProject;
exports.resolveUrl = resolveUrl;
exports.sortImportMap = sortImportMap;
exports.wrapImportMap = wrapImportMap;
//# sourceMappingURL=main.js.map
