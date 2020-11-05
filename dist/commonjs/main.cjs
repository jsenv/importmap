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

const urlToScheme = urlString => {
  const colonIndex = urlString.indexOf(":");
  if (colonIndex === -1) return "";
  return urlString.slice(0, colonIndex);
};

const urlToPathname = urlString => {
  return ressourceToPathname(urlToRessource(urlString));
};

const urlToRessource = urlString => {
  const scheme = urlToScheme(urlString);

  if (scheme === "file") {
    return urlString.slice("file://".length);
  }

  if (scheme === "https" || scheme === "http") {
    // remove origin
    const afterProtocol = urlString.slice(scheme.length + "://".length);
    const pathnameSlashIndex = afterProtocol.indexOf("/", "://".length);
    return afterProtocol.slice(pathnameSlashIndex);
  }

  return urlString.slice(scheme.length + 1);
};

const ressourceToPathname = ressource => {
  const searchSeparatorIndex = ressource.indexOf("?");
  return searchSeparatorIndex === -1 ? ressource : ressource.slice(0, searchSeparatorIndex);
};

const urlToOrigin = urlString => {
  const scheme = urlToScheme(urlString);

  if (scheme === "file") {
    return "file://";
  }

  if (scheme === "http" || scheme === "https") {
    const secondProtocolSlashIndex = scheme.length + "://".length;
    const pathnameSlashIndex = urlString.indexOf("/", secondProtocolSlashIndex);
    if (pathnameSlashIndex === -1) return urlString;
    return urlString.slice(0, pathnameSlashIndex);
  }

  return urlString.slice(0, scheme.length + 1);
};

const pathnameToParentPathname = pathname => {
  const slashLastIndex = pathname.lastIndexOf("/");

  if (slashLastIndex === -1) {
    return "/";
  }

  return pathname.slice(0, slashLastIndex + 1);
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
    return `${urlToScheme(baseUrl)}:${specifier}`;
  } // origin relative


  if (specifier[0] === "/") {
    return `${urlToOrigin(baseUrl)}${specifier}`;
  }

  const baseOrigin = urlToOrigin(baseUrl);
  const basePathname = urlToPathname(baseUrl);

  if (specifier === ".") {
    const baseDirectoryPathname = pathnameToParentPathname(basePathname);
    return `${baseOrigin}${baseDirectoryPathname}`;
  } // pathname relative inside


  if (specifier.slice(0, 2) === "./") {
    const baseDirectoryPathname = pathnameToParentPathname(basePathname);
    return `${baseOrigin}${baseDirectoryPathname}${specifier.slice(2)}`;
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

  return `${baseOrigin}${pathnameToParentPathname(basePathname)}${specifier}`;
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
  if (specifier === "." || specifier[0] === "/" || specifier.startsWith("./") || specifier.startsWith("../")) {
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
  const importMap = {};
  const leftImports = leftImportMap.imports;
  const rightImports = rightImportMap.imports;
  const leftHasImports = Boolean(leftImports);
  const rightHasImports = Boolean(rightImports);

  if (leftHasImports && rightHasImports) {
    importMap.imports = composeTwoImports(leftImports, rightImports);
  } else if (leftHasImports) {
    importMap.imports = { ...leftImports
    };
  } else if (rightHasImports) {
    importMap.imports = { ...rightImports
    };
  }

  const leftScopes = leftImportMap.scopes;
  const rightScopes = rightImportMap.scopes;
  const leftHasScopes = Boolean(leftScopes);
  const rightHasScopes = Boolean(rightScopes);

  if (leftHasScopes && rightHasScopes) {
    importMap.scopes = composeTwoScopes(leftScopes, rightScopes, importMap.imports || {});
  } else if (leftHasScopes) {
    importMap.scopes = { ...leftScopes
    };
  } else if (rightHasScopes) {
    importMap.scopes = { ...rightScopes
    };
  }

  return importMap;
};

const composeTwoImports = (leftImports, rightImports) => {
  const topLevelMappings = {};
  Object.keys(leftImports).forEach(leftSpecifier => {
    if (objectHasKey(rightImports, leftSpecifier)) {
      // will be overidden
      return;
    }

    const leftAddress = leftImports[leftSpecifier];
    const rightSpecifier = Object.keys(rightImports).find(rightSpecifier => {
      return compareAddressAndSpecifier(leftAddress, rightSpecifier);
    });
    topLevelMappings[leftSpecifier] = rightSpecifier ? rightImports[rightSpecifier] : leftSpecifier;
  });
  Object.keys(rightImports).forEach(rightSpecifier => {
    topLevelMappings[rightSpecifier] = rightImports[rightSpecifier];
  });
  return topLevelMappings;
};

const objectHasKey = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const compareAddressAndSpecifier = (address, specifier) => {
  const addressUrl = resolveUrl(address, "file:///");
  const specifierUrl = resolveUrl(specifier, "file:///");
  return addressUrl === specifierUrl;
};

const composeTwoScopes = (leftScopes, rightScopes, topLevelRemappings) => {
  const scopedRemappings = {};
  Object.keys(leftScopes).forEach(leftScopeKey => {
    if (objectHasKey(rightScopes, leftScopeKey)) {
      // will be merged
      scopedRemappings[leftScopeKey] = leftScopes[leftScopeKey];
      return;
    }

    const topLevelSpecifier = Object.keys(topLevelRemappings).find(topLevelSpecifierCandidate => {
      return compareAddressAndSpecifier(leftScopeKey, topLevelSpecifierCandidate);
    });

    if (topLevelSpecifier) {
      scopedRemappings[topLevelRemappings[topLevelSpecifier]] = leftScopes[leftScopeKey];
    } else {
      scopedRemappings[leftScopeKey] = leftScopes[leftScopeKey];
    }
  });
  Object.keys(rightScopes).forEach(rightScopeKey => {
    if (objectHasKey(scopedRemappings, rightScopeKey)) {
      scopedRemappings[rightScopeKey] = composeTwoImports(scopedRemappings[rightScopeKey], rightScopes[rightScopeKey]);
    } else {
      scopedRemappings[rightScopeKey] = { ...rightScopes[rightScopeKey]
      };
    }
  });
  return scopedRemappings;
};

const getCommonPathname = (pathname, otherPathname) => {
  const firstDifferentCharacterIndex = findFirstDifferentCharacterIndex(pathname, otherPathname); // pathname and otherpathname are exactly the same

  if (firstDifferentCharacterIndex === -1) {
    return pathname;
  }

  const commonString = pathname.slice(0, firstDifferentCharacterIndex + 1); // the first different char is at firstDifferentCharacterIndex

  if (pathname.charAt(firstDifferentCharacterIndex) === "/") {
    return commonString;
  }

  if (otherPathname.charAt(firstDifferentCharacterIndex) === "/") {
    return commonString;
  }

  const firstDifferentSlashIndex = commonString.lastIndexOf("/");
  return pathname.slice(0, firstDifferentSlashIndex + 1);
};

const findFirstDifferentCharacterIndex = (string, otherString) => {
  const maxCommonLength = Math.min(string.length, otherString.length);
  let i = 0;

  while (i < maxCommonLength) {
    const char = string.charAt(i);
    const otherChar = otherString.charAt(i);

    if (char !== otherChar) {
      return i;
    }

    i++;
  }

  if (string.length === otherString.length) {
    return -1;
  } // they differ at maxCommonLength


  return maxCommonLength;
};

const urlToRelativeUrl = (urlArg, baseUrlArg) => {
  const url = new URL(urlArg);
  const baseUrl = new URL(baseUrlArg);

  if (url.protocol !== baseUrl.protocol) {
    return urlArg;
  }

  if (url.username !== baseUrl.username || url.password !== baseUrl.password) {
    return urlArg.slice(url.protocol.length);
  }

  if (url.host !== baseUrl.host) {
    return urlArg.slice(url.protocol.length);
  }

  const {
    pathname,
    hash,
    search
  } = url;

  if (pathname === "/") {
    return baseUrl.pathname.slice(1);
  }

  const {
    pathname: basePathname
  } = baseUrl;
  const commonPathname = getCommonPathname(pathname, basePathname);

  if (!commonPathname) {
    return urlArg;
  }

  const specificPathname = pathname.slice(commonPathname.length);
  const baseSpecificPathname = basePathname.slice(commonPathname.length);

  if (baseSpecificPathname.includes("/")) {
    const baseSpecificParentPathname = pathnameToParentPathname(baseSpecificPathname);
    const relativeDirectoriesNotation = baseSpecificParentPathname.replace(/.*?\//g, "../");
    return `${relativeDirectoriesNotation}${specificPathname}${search}${hash}`;
  }

  return `${specificPathname}${search}${hash}`;
};

const moveImportMap = (importMap, fromUrl, toUrl) => {
  assertImportMap(importMap);

  const makeRelativeTo = (value, type) => {
    let url;

    if (type === "specifier") {
      url = resolveSpecifier(value, fromUrl);

      if (!url) {
        // bare specifier
        return value;
      }
    } else {
      url = resolveUrl(value, fromUrl);
    }

    const relativeUrl = urlToRelativeUrl(url, toUrl);

    if (relativeUrl.startsWith("../")) {
      return relativeUrl;
    }

    if (relativeUrl.startsWith("./")) {
      return relativeUrl;
    }

    if (hasScheme(relativeUrl)) {
      return relativeUrl;
    }

    return `./${relativeUrl}`;
  };

  const importMapRelative = {};
  const {
    imports
  } = importMap;

  if (imports) {
    importMapRelative.imports = makeImportsRelativeTo(imports, makeRelativeTo) || imports;
  }

  const {
    scopes
  } = importMap;

  if (scopes) {
    importMapRelative.scopes = makeScopedRemappingRelativeTo(scopes, makeRelativeTo) || scopes;
  } // nothing changed


  if (importMapRelative.imports === imports && importMapRelative.scopes === scopes) {
    return importMap;
  }

  return importMapRelative;
};

const makeScopedRemappingRelativeTo = (scopes, makeRelativeTo) => {
  const scopesTransformed = {};
  const scopesRemaining = {};
  let transformed = false;
  Object.keys(scopes).forEach(scopeKey => {
    const scopeValue = scopes[scopeKey];
    const scopeKeyRelative = makeRelativeTo(scopeKey, "address");
    const scopeValueRelative = makeImportsRelativeTo(scopeValue, makeRelativeTo);

    if (scopeKeyRelative) {
      transformed = true;
      scopesTransformed[scopeKeyRelative] = scopeValueRelative || scopeValue;
    } else if (scopeValueRelative) {
      transformed = true;
      scopesTransformed[scopeKey] = scopeValueRelative;
    } else {
      scopesRemaining[scopeKey] = scopeValueRelative;
    }
  });
  return transformed ? { ...scopesTransformed,
    ...scopesRemaining
  } : null;
};

const makeImportsRelativeTo = (imports, makeRelativeTo) => {
  const importsTransformed = {};
  const importsRemaining = {};
  let transformed = false;
  Object.keys(imports).forEach(importKey => {
    const importValue = imports[importKey];
    const importKeyRelative = makeRelativeTo(importKey, "specifier");
    const importValueRelative = makeRelativeTo(importValue, "address");

    if (importKeyRelative) {
      transformed = true;
      importsTransformed[importKeyRelative] = importValueRelative || importValue;
    } else if (importValueRelative) {
      transformed = true;
      importsTransformed[importKey] = importValueRelative;
    } else {
      importsRemaining[importKey] = importValue;
    }
  });
  return transformed ? { ...importsTransformed,
    ...importsRemaining
  } : null;
};

const sortImportMap = importMap => {
  assertImportMap(importMap);
  const {
    imports,
    scopes
  } = importMap;
  return { ...(imports ? {
      imports: sortImports(imports)
    } : {}),
    ...(scopes ? {
      scopes: sortScopes(scopes)
    } : {})
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

const pathnameToExtension = pathname => {
  const slashLastIndex = pathname.lastIndexOf("/");

  if (slashLastIndex !== -1) {
    pathname = pathname.slice(slashLastIndex + 1);
  }

  const dotLastIndex = pathname.lastIndexOf(".");
  if (dotLastIndex === -1) return ""; // if (dotLastIndex === pathname.length - 1) return ""

  return pathname.slice(dotLastIndex);
};

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
  if (urlToPathname(url).endsWith("/")) {
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
      const importerPathname = urlToPathname(importer);
      const importerExtension = pathnameToExtension(importerPathname);
      return `${url}${importerExtension}`;
    }
  }

  return url;
};

exports.applyImportMap = applyImportMap;
exports.composeTwoImportMaps = composeTwoImportMaps;
exports.moveImportMap = moveImportMap;
exports.normalizeImportMap = normalizeImportMap;
exports.resolveImport = resolveImport;
exports.resolveSpecifier = resolveSpecifier;
exports.resolveUrl = resolveUrl;
exports.sortImportMap = sortImportMap;

//# sourceMappingURL=main.cjs.map