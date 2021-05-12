var createDetailedMessage = function createDetailedMessage(message) {
  var details = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var string = "".concat(message);
  Object.keys(details).forEach(function (key) {
    var value = details[key];
    string += "\n--- ".concat(key, " ---\n").concat(Array.isArray(value) ? value.join("\n") : value);
  });
  return string;
};

var nativeTypeOf = function nativeTypeOf(obj) {
  return typeof obj;
};

var customTypeOf = function customTypeOf(obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? nativeTypeOf : customTypeOf;

var assertImportMap = function assertImportMap(value) {
  if (value === null) {
    throw new TypeError("an importMap must be an object, got null");
  }

  var type = _typeof(value);

  if (type !== "object") {
    throw new TypeError("an importMap must be an object, received ".concat(value));
  }

  if (Array.isArray(value)) {
    throw new TypeError("an importMap must be an object, received array ".concat(value));
  }
};

var hasScheme = function hasScheme(string) {
  return /^[a-zA-Z]{2,}:/.test(string);
};

var urlToScheme = function urlToScheme(urlString) {
  var colonIndex = urlString.indexOf(":");
  if (colonIndex === -1) return "";
  return urlString.slice(0, colonIndex);
};

var urlToPathname = function urlToPathname(urlString) {
  return ressourceToPathname(urlToRessource(urlString));
};

var urlToRessource = function urlToRessource(urlString) {
  var scheme = urlToScheme(urlString);

  if (scheme === "file") {
    return urlString.slice("file://".length);
  }

  if (scheme === "https" || scheme === "http") {
    // remove origin
    var afterProtocol = urlString.slice(scheme.length + "://".length);
    var pathnameSlashIndex = afterProtocol.indexOf("/", "://".length);
    return afterProtocol.slice(pathnameSlashIndex);
  }

  return urlString.slice(scheme.length + 1);
};

var ressourceToPathname = function ressourceToPathname(ressource) {
  var searchSeparatorIndex = ressource.indexOf("?");
  return searchSeparatorIndex === -1 ? ressource : ressource.slice(0, searchSeparatorIndex);
};

var urlToOrigin = function urlToOrigin(urlString) {
  var scheme = urlToScheme(urlString);

  if (scheme === "file") {
    return "file://";
  }

  if (scheme === "http" || scheme === "https") {
    var secondProtocolSlashIndex = scheme.length + "://".length;
    var pathnameSlashIndex = urlString.indexOf("/", secondProtocolSlashIndex);
    if (pathnameSlashIndex === -1) return urlString;
    return urlString.slice(0, pathnameSlashIndex);
  }

  return urlString.slice(0, scheme.length + 1);
};

var pathnameToParentPathname = function pathnameToParentPathname(pathname) {
  var slashLastIndex = pathname.lastIndexOf("/");

  if (slashLastIndex === -1) {
    return "/";
  }

  return pathname.slice(0, slashLastIndex + 1);
};

// could be useful: https://url.spec.whatwg.org/#url-miscellaneous
var resolveUrl = function resolveUrl(specifier, baseUrl) {
  if (baseUrl) {
    if (typeof baseUrl !== "string") {
      throw new TypeError(writeBaseUrlMustBeAString({
        baseUrl: baseUrl,
        specifier: specifier
      }));
    }

    if (!hasScheme(baseUrl)) {
      throw new Error(writeBaseUrlMustBeAbsolute({
        baseUrl: baseUrl,
        specifier: specifier
      }));
    }
  }

  if (hasScheme(specifier)) {
    return specifier;
  }

  if (!baseUrl) {
    throw new Error(writeBaseUrlRequired({
      baseUrl: baseUrl,
      specifier: specifier
    }));
  } // scheme relative


  if (specifier.slice(0, 2) === "//") {
    return "".concat(urlToScheme(baseUrl), ":").concat(specifier);
  } // origin relative


  if (specifier[0] === "/") {
    return "".concat(urlToOrigin(baseUrl)).concat(specifier);
  }

  var baseOrigin = urlToOrigin(baseUrl);
  var basePathname = urlToPathname(baseUrl);

  if (specifier === ".") {
    var baseDirectoryPathname = pathnameToParentPathname(basePathname);
    return "".concat(baseOrigin).concat(baseDirectoryPathname);
  } // pathname relative inside


  if (specifier.slice(0, 2) === "./") {
    var _baseDirectoryPathname = pathnameToParentPathname(basePathname);

    return "".concat(baseOrigin).concat(_baseDirectoryPathname).concat(specifier.slice(2));
  } // pathname relative outside


  if (specifier.slice(0, 3) === "../") {
    var unresolvedPathname = specifier;
    var importerFolders = basePathname.split("/");
    importerFolders.pop();

    while (unresolvedPathname.slice(0, 3) === "../") {
      unresolvedPathname = unresolvedPathname.slice(3); // when there is no folder left to resolved
      // we just ignore '../'

      if (importerFolders.length) {
        importerFolders.pop();
      }
    }

    var resolvedPathname = "".concat(importerFolders.join("/"), "/").concat(unresolvedPathname);
    return "".concat(baseOrigin).concat(resolvedPathname);
  } // bare


  if (basePathname === "") {
    return "".concat(baseOrigin, "/").concat(specifier);
  }

  if (basePathname[basePathname.length] === "/") {
    return "".concat(baseOrigin).concat(basePathname).concat(specifier);
  }

  return "".concat(baseOrigin).concat(pathnameToParentPathname(basePathname)).concat(specifier);
};

var writeBaseUrlMustBeAString = function writeBaseUrlMustBeAString(_ref) {
  var baseUrl = _ref.baseUrl,
      specifier = _ref.specifier;
  return "baseUrl must be a string.\n--- base url ---\n".concat(baseUrl, "\n--- specifier ---\n").concat(specifier);
};

var writeBaseUrlMustBeAbsolute = function writeBaseUrlMustBeAbsolute(_ref2) {
  var baseUrl = _ref2.baseUrl,
      specifier = _ref2.specifier;
  return "baseUrl must be absolute.\n--- base url ---\n".concat(baseUrl, "\n--- specifier ---\n").concat(specifier);
};

var writeBaseUrlRequired = function writeBaseUrlRequired(_ref3) {
  var baseUrl = _ref3.baseUrl,
      specifier = _ref3.specifier;
  return "baseUrl required to resolve relative specifier.\n--- base url ---\n".concat(baseUrl, "\n--- specifier ---\n").concat(specifier);
};

var tryUrlResolution = function tryUrlResolution(string, url) {
  var result = resolveUrl(string, url);
  return hasScheme(result) ? result : null;
};

var resolveSpecifier = function resolveSpecifier(specifier, importer) {
  if (specifier === "." || specifier[0] === "/" || specifier.startsWith("./") || specifier.startsWith("../")) {
    return resolveUrl(specifier, importer);
  }

  if (hasScheme(specifier)) {
    return specifier;
  }

  return null;
};

var applyImportMap = function applyImportMap(_ref) {
  var importMap = _ref.importMap,
      specifier = _ref.specifier,
      importer = _ref.importer,
      _ref$createBareSpecif = _ref.createBareSpecifierError,
      createBareSpecifierError = _ref$createBareSpecif === void 0 ? function (_ref2) {
    var specifier = _ref2.specifier,
        importer = _ref2.importer;
    return new Error(createDetailedMessage("Unmapped bare specifier.", {
      specifier: specifier,
      importer: importer
    }));
  } : _ref$createBareSpecif,
      _ref$onImportMapping = _ref.onImportMapping,
      onImportMapping = _ref$onImportMapping === void 0 ? function () {} : _ref$onImportMapping;
  assertImportMap(importMap);

  if (typeof specifier !== "string") {
    throw new TypeError(createDetailedMessage("specifier must be a string.", {
      specifier: specifier,
      importer: importer
    }));
  }

  if (importer) {
    if (typeof importer !== "string") {
      throw new TypeError(createDetailedMessage("importer must be a string.", {
        importer: importer,
        specifier: specifier
      }));
    }

    if (!hasScheme(importer)) {
      throw new Error(createDetailedMessage("importer must be an absolute url.", {
        importer: importer,
        specifier: specifier
      }));
    }
  }

  var specifierUrl = resolveSpecifier(specifier, importer);
  var specifierNormalized = specifierUrl || specifier;
  var scopes = importMap.scopes;

  if (scopes && importer) {
    var scopeSpecifierMatching = Object.keys(scopes).find(function (scopeSpecifier) {
      return scopeSpecifier === importer || specifierIsPrefixOf(scopeSpecifier, importer);
    });

    if (scopeSpecifierMatching) {
      var scopeMappings = scopes[scopeSpecifierMatching];
      var mappingFromScopes = applyMappings(scopeMappings, specifierNormalized, scopeSpecifierMatching, onImportMapping);

      if (mappingFromScopes !== null) {
        return mappingFromScopes;
      }
    }
  }

  var imports = importMap.imports;

  if (imports) {
    var mappingFromImports = applyMappings(imports, specifierNormalized, undefined, onImportMapping);

    if (mappingFromImports !== null) {
      return mappingFromImports;
    }
  }

  if (specifierUrl) {
    return specifierUrl;
  }

  throw createBareSpecifierError({
    specifier: specifier,
    importer: importer
  });
};

var applyMappings = function applyMappings(mappings, specifierNormalized, scope, onImportMapping) {
  var specifierCandidates = Object.keys(mappings);
  var i = 0;

  while (i < specifierCandidates.length) {
    var specifierCandidate = specifierCandidates[i];
    i++;

    if (specifierCandidate === specifierNormalized) {
      var address = mappings[specifierCandidate];
      onImportMapping({
        scope: scope,
        from: specifierCandidate,
        to: address,
        before: specifierNormalized,
        after: address
      });
      return address;
    }

    if (specifierIsPrefixOf(specifierCandidate, specifierNormalized)) {
      var _address = mappings[specifierCandidate];
      var afterSpecifier = specifierNormalized.slice(specifierCandidate.length);
      var addressFinal = tryUrlResolution(afterSpecifier, _address);
      onImportMapping({
        scope: scope,
        from: specifierCandidate,
        to: _address,
        before: specifierNormalized,
        after: addressFinal
      });
      return addressFinal;
    }
  }

  return null;
};

var specifierIsPrefixOf = function specifierIsPrefixOf(specifierHref, href) {
  return specifierHref[specifierHref.length - 1] === "/" && href.startsWith(specifierHref);
};

var defineProperty = (function (obj, key, value) {
  // Shortcircuit the slow defineProperty path when possible.
  // We are trying to avoid issues where setters defined on the
  // prototype cause side effects under the fast path of simple
  // assignment. By checking for existence of the property with
  // the in operator, we can optimize most of this overhead away.
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
});

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var composeTwoImportMaps = function composeTwoImportMaps(leftImportMap, rightImportMap) {
  assertImportMap(leftImportMap);
  assertImportMap(rightImportMap);
  var importMap = {};
  var leftImports = leftImportMap.imports;
  var rightImports = rightImportMap.imports;
  var leftHasImports = Boolean(leftImports);
  var rightHasImports = Boolean(rightImports);

  if (leftHasImports && rightHasImports) {
    importMap.imports = composeTwoMappings(leftImports, rightImports);
  } else if (leftHasImports) {
    importMap.imports = _objectSpread2({}, leftImports);
  } else if (rightHasImports) {
    importMap.imports = _objectSpread2({}, rightImports);
  }

  var leftScopes = leftImportMap.scopes;
  var rightScopes = rightImportMap.scopes;
  var leftHasScopes = Boolean(leftScopes);
  var rightHasScopes = Boolean(rightScopes);

  if (leftHasScopes && rightHasScopes) {
    importMap.scopes = composeTwoScopes(leftScopes, rightScopes, importMap.imports || {});
  } else if (leftHasScopes) {
    importMap.scopes = _objectSpread2({}, leftScopes);
  } else if (rightHasScopes) {
    importMap.scopes = _objectSpread2({}, rightScopes);
  }

  return importMap;
};

var composeTwoMappings = function composeTwoMappings(leftMappings, rightMappings) {
  var mappings = {};
  Object.keys(leftMappings).forEach(function (leftSpecifier) {
    if (objectHasKey(rightMappings, leftSpecifier)) {
      // will be overidden
      return;
    }

    var leftAddress = leftMappings[leftSpecifier];
    var rightSpecifier = Object.keys(rightMappings).find(function (rightSpecifier) {
      return compareAddressAndSpecifier(leftAddress, rightSpecifier);
    });
    mappings[leftSpecifier] = rightSpecifier ? rightMappings[rightSpecifier] : leftAddress;
  });
  Object.keys(rightMappings).forEach(function (rightSpecifier) {
    mappings[rightSpecifier] = rightMappings[rightSpecifier];
  });
  return mappings;
};

var objectHasKey = function objectHasKey(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
};

var compareAddressAndSpecifier = function compareAddressAndSpecifier(address, specifier) {
  var addressUrl = resolveUrl(address, "file:///");
  var specifierUrl = resolveUrl(specifier, "file:///");
  return addressUrl === specifierUrl;
};

var composeTwoScopes = function composeTwoScopes(leftScopes, rightScopes, imports) {
  var scopes = {};
  Object.keys(leftScopes).forEach(function (leftScopeKey) {
    if (objectHasKey(rightScopes, leftScopeKey)) {
      // will be merged
      scopes[leftScopeKey] = leftScopes[leftScopeKey];
      return;
    }

    var topLevelSpecifier = Object.keys(imports).find(function (topLevelSpecifierCandidate) {
      return compareAddressAndSpecifier(leftScopeKey, topLevelSpecifierCandidate);
    });

    if (topLevelSpecifier) {
      scopes[imports[topLevelSpecifier]] = leftScopes[leftScopeKey];
    } else {
      scopes[leftScopeKey] = leftScopes[leftScopeKey];
    }
  });
  Object.keys(rightScopes).forEach(function (rightScopeKey) {
    if (objectHasKey(scopes, rightScopeKey)) {
      scopes[rightScopeKey] = composeTwoMappings(scopes[rightScopeKey], rightScopes[rightScopeKey]);
    } else {
      scopes[rightScopeKey] = _objectSpread2({}, rightScopes[rightScopeKey]);
    }
  });
  return scopes;
};

var getCommonPathname = function getCommonPathname(pathname, otherPathname) {
  var firstDifferentCharacterIndex = findFirstDifferentCharacterIndex(pathname, otherPathname); // pathname and otherpathname are exactly the same

  if (firstDifferentCharacterIndex === -1) {
    return pathname;
  }

  var commonString = pathname.slice(0, firstDifferentCharacterIndex + 1); // the first different char is at firstDifferentCharacterIndex

  if (pathname.charAt(firstDifferentCharacterIndex) === "/") {
    return commonString;
  }

  if (otherPathname.charAt(firstDifferentCharacterIndex) === "/") {
    return commonString;
  }

  var firstDifferentSlashIndex = commonString.lastIndexOf("/");
  return pathname.slice(0, firstDifferentSlashIndex + 1);
};

var findFirstDifferentCharacterIndex = function findFirstDifferentCharacterIndex(string, otherString) {
  var maxCommonLength = Math.min(string.length, otherString.length);
  var i = 0;

  while (i < maxCommonLength) {
    var char = string.charAt(i);
    var otherChar = otherString.charAt(i);

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

var urlToRelativeUrl = function urlToRelativeUrl(urlArg, baseUrlArg) {
  var url = new URL(urlArg);
  var baseUrl = new URL(baseUrlArg);

  if (url.protocol !== baseUrl.protocol) {
    return urlArg;
  }

  if (url.username !== baseUrl.username || url.password !== baseUrl.password) {
    return urlArg.slice(url.protocol.length);
  }

  if (url.host !== baseUrl.host) {
    return urlArg.slice(url.protocol.length);
  }

  var pathname = url.pathname,
      hash = url.hash,
      search = url.search;

  if (pathname === "/") {
    return baseUrl.pathname.slice(1);
  }

  var basePathname = baseUrl.pathname;
  var commonPathname = getCommonPathname(pathname, basePathname);

  if (!commonPathname) {
    return urlArg;
  }

  var specificPathname = pathname.slice(commonPathname.length);
  var baseSpecificPathname = basePathname.slice(commonPathname.length);

  if (baseSpecificPathname.includes("/")) {
    var baseSpecificParentPathname = pathnameToParentPathname(baseSpecificPathname);
    var relativeDirectoriesNotation = baseSpecificParentPathname.replace(/.*?\//g, "../");
    return "".concat(relativeDirectoriesNotation).concat(specificPathname).concat(search).concat(hash);
  }

  return "".concat(specificPathname).concat(search).concat(hash);
};

var moveImportMap = function moveImportMap(importMap, fromUrl, toUrl) {
  assertImportMap(importMap);

  var makeRelativeTo = function makeRelativeTo(value, type) {
    var url;

    if (type === "specifier") {
      url = resolveSpecifier(value, fromUrl);

      if (!url) {
        // bare specifier
        return value;
      }
    } else {
      url = resolveUrl(value, fromUrl);
    }

    var relativeUrl = urlToRelativeUrl(url, toUrl);

    if (relativeUrl.startsWith("../")) {
      return relativeUrl;
    }

    if (relativeUrl.startsWith("./")) {
      return relativeUrl;
    }

    if (hasScheme(relativeUrl)) {
      return relativeUrl;
    }

    return "./".concat(relativeUrl);
  };

  var importMapRelative = {};
  var imports = importMap.imports;

  if (imports) {
    importMapRelative.imports = makeMappingsRelativeTo(imports, makeRelativeTo) || imports;
  }

  var scopes = importMap.scopes;

  if (scopes) {
    importMapRelative.scopes = makeScopesRelativeTo(scopes, makeRelativeTo) || scopes;
  } // nothing changed


  if (importMapRelative.imports === imports && importMapRelative.scopes === scopes) {
    return importMap;
  }

  return importMapRelative;
};

var makeMappingsRelativeTo = function makeMappingsRelativeTo(mappings, makeRelativeTo) {
  var mappingsTransformed = {};
  var mappingsRemaining = {};
  var transformed = false;
  Object.keys(mappings).forEach(function (specifier) {
    var address = mappings[specifier];
    var specifierRelative = makeRelativeTo(specifier, "specifier");
    var addressRelative = makeRelativeTo(address, "address");

    if (specifierRelative) {
      transformed = true;
      mappingsTransformed[specifierRelative] = addressRelative || address;
    } else if (addressRelative) {
      transformed = true;
      mappingsTransformed[specifier] = addressRelative;
    } else {
      mappingsRemaining[specifier] = address;
    }
  });
  return transformed ? _objectSpread2(_objectSpread2({}, mappingsTransformed), mappingsRemaining) : null;
};

var makeScopesRelativeTo = function makeScopesRelativeTo(scopes, makeRelativeTo) {
  var scopesTransformed = {};
  var scopesRemaining = {};
  var transformed = false;
  Object.keys(scopes).forEach(function (scopeSpecifier) {
    var scopeMappings = scopes[scopeSpecifier];
    var scopeSpecifierRelative = makeRelativeTo(scopeSpecifier, "address");
    var scopeMappingsRelative = makeMappingsRelativeTo(scopeMappings, makeRelativeTo);

    if (scopeSpecifierRelative) {
      transformed = true;
      scopesTransformed[scopeSpecifierRelative] = scopeMappingsRelative || scopeMappings;
    } else if (scopeMappingsRelative) {
      transformed = true;
      scopesTransformed[scopeSpecifier] = scopeMappingsRelative;
    } else {
      scopesRemaining[scopeSpecifier] = scopeMappingsRelative;
    }
  });
  return transformed ? _objectSpread2(_objectSpread2({}, scopesTransformed), scopesRemaining) : null;
};

var sortImportMap = function sortImportMap(importMap) {
  assertImportMap(importMap);
  var imports = importMap.imports,
      scopes = importMap.scopes;
  return _objectSpread2(_objectSpread2({}, imports ? {
    imports: sortImports(imports)
  } : {}), scopes ? {
    scopes: sortScopes(scopes)
  } : {});
};
var sortImports = function sortImports(imports) {
  var mappingsSorted = {};
  Object.keys(imports).sort(compareLengthOrLocaleCompare).forEach(function (name) {
    mappingsSorted[name] = imports[name];
  });
  return mappingsSorted;
};
var sortScopes = function sortScopes(scopes) {
  var scopesSorted = {};
  Object.keys(scopes).sort(compareLengthOrLocaleCompare).forEach(function (scopeSpecifier) {
    scopesSorted[scopeSpecifier] = sortImports(scopes[scopeSpecifier]);
  });
  return scopesSorted;
};

var compareLengthOrLocaleCompare = function compareLengthOrLocaleCompare(a, b) {
  return b.length - a.length || a.localeCompare(b);
};

var normalizeImportMap = function normalizeImportMap(importMap, baseUrl) {
  assertImportMap(importMap);

  if (!isStringOrUrl(baseUrl)) {
    throw new TypeError(formulateBaseUrlMustBeStringOrUrl({
      baseUrl: baseUrl
    }));
  }

  var imports = importMap.imports,
      scopes = importMap.scopes;
  return {
    imports: imports ? normalizeMappings(imports, baseUrl) : undefined,
    scopes: scopes ? normalizeScopes(scopes, baseUrl) : undefined
  };
};

var isStringOrUrl = function isStringOrUrl(value) {
  if (typeof value === "string") {
    return true;
  }

  if (typeof URL === "function" && value instanceof URL) {
    return true;
  }

  return false;
};

var normalizeMappings = function normalizeMappings(mappings, baseUrl) {
  var mappingsNormalized = {};
  Object.keys(mappings).forEach(function (specifier) {
    var address = mappings[specifier];

    if (typeof address !== "string") {
      console.warn(formulateAddressMustBeAString({
        address: address,
        specifier: specifier
      }));
      return;
    }

    var specifierResolved = resolveSpecifier(specifier, baseUrl) || specifier;
    var addressUrl = tryUrlResolution(address, baseUrl);

    if (addressUrl === null) {
      console.warn(formulateAdressResolutionFailed({
        address: address,
        baseUrl: baseUrl,
        specifier: specifier
      }));
      return;
    }

    if (specifier.endsWith("/") && !addressUrl.endsWith("/")) {
      console.warn(formulateAddressUrlRequiresTrailingSlash({
        addressUrl: addressUrl,
        address: address,
        specifier: specifier
      }));
      return;
    }

    mappingsNormalized[specifierResolved] = addressUrl;
  });
  return sortImports(mappingsNormalized);
};

var normalizeScopes = function normalizeScopes(scopes, baseUrl) {
  var scopesNormalized = {};
  Object.keys(scopes).forEach(function (scopeSpecifier) {
    var scopeMappings = scopes[scopeSpecifier];
    var scopeUrl = tryUrlResolution(scopeSpecifier, baseUrl);

    if (scopeUrl === null) {
      console.warn(formulateScopeResolutionFailed({
        scope: scopeSpecifier,
        baseUrl: baseUrl
      }));
      return;
    }

    var scopeValueNormalized = normalizeMappings(scopeMappings, baseUrl);
    scopesNormalized[scopeUrl] = scopeValueNormalized;
  });
  return sortScopes(scopesNormalized);
};

var formulateBaseUrlMustBeStringOrUrl = function formulateBaseUrlMustBeStringOrUrl(_ref) {
  var baseUrl = _ref.baseUrl;
  return "baseUrl must be a string or an url.\n--- base url ---\n".concat(baseUrl);
};

var formulateAddressMustBeAString = function formulateAddressMustBeAString(_ref2) {
  var specifier = _ref2.specifier,
      address = _ref2.address;
  return "Address must be a string.\n--- address ---\n".concat(address, "\n--- specifier ---\n").concat(specifier);
};

var formulateAdressResolutionFailed = function formulateAdressResolutionFailed(_ref3) {
  var address = _ref3.address,
      baseUrl = _ref3.baseUrl,
      specifier = _ref3.specifier;
  return "Address url resolution failed.\n--- address ---\n".concat(address, "\n--- base url ---\n").concat(baseUrl, "\n--- specifier ---\n").concat(specifier);
};

var formulateAddressUrlRequiresTrailingSlash = function formulateAddressUrlRequiresTrailingSlash(_ref4) {
  var addressURL = _ref4.addressURL,
      address = _ref4.address,
      specifier = _ref4.specifier;
  return "Address must end with /.\n--- address url ---\n".concat(addressURL, "\n--- address ---\n").concat(address, "\n--- specifier ---\n").concat(specifier);
};

var formulateScopeResolutionFailed = function formulateScopeResolutionFailed(_ref5) {
  var scope = _ref5.scope,
      baseUrl = _ref5.baseUrl;
  return "Scope url resolution failed.\n--- scope ---\n".concat(scope, "\n--- base url ---\n").concat(baseUrl);
};

var pathnameToExtension = function pathnameToExtension(pathname) {
  var slashLastIndex = pathname.lastIndexOf("/");

  if (slashLastIndex !== -1) {
    pathname = pathname.slice(slashLastIndex + 1);
  }

  var dotLastIndex = pathname.lastIndexOf(".");
  if (dotLastIndex === -1) return ""; // if (dotLastIndex === pathname.length - 1) return ""

  return pathname.slice(dotLastIndex);
};

var resolveImport = function resolveImport(_ref) {
  var specifier = _ref.specifier,
      importer = _ref.importer,
      importMap = _ref.importMap,
      _ref$defaultExtension = _ref.defaultExtension,
      defaultExtension = _ref$defaultExtension === void 0 ? true : _ref$defaultExtension,
      createBareSpecifierError = _ref.createBareSpecifierError,
      _ref$onImportMapping = _ref.onImportMapping,
      onImportMapping = _ref$onImportMapping === void 0 ? function () {} : _ref$onImportMapping;
  return applyDefaultExtension({
    url: importMap ? applyImportMap({
      importMap: importMap,
      specifier: specifier,
      importer: importer,
      createBareSpecifierError: createBareSpecifierError,
      onImportMapping: onImportMapping
    }) : resolveUrl(specifier, importer),
    importer: importer,
    defaultExtension: defaultExtension
  });
};

var applyDefaultExtension = function applyDefaultExtension(_ref2) {
  var url = _ref2.url,
      importer = _ref2.importer,
      defaultExtension = _ref2.defaultExtension;

  if (urlToPathname(url).endsWith("/")) {
    return url;
  }

  if (typeof defaultExtension === "string") {
    var extension = pathnameToExtension(url);

    if (extension === "") {
      return "".concat(url).concat(defaultExtension);
    }

    return url;
  }

  if (defaultExtension === true) {
    var _extension = pathnameToExtension(url);

    if (_extension === "" && importer) {
      var importerPathname = urlToPathname(importer);
      var importerExtension = pathnameToExtension(importerPathname);
      return "".concat(url).concat(importerExtension);
    }
  }

  return url;
};

export { applyImportMap, composeTwoImportMaps, moveImportMap, normalizeImportMap, resolveImport, resolveSpecifier, resolveUrl, sortImportMap };

//# sourceMappingURL=jsenv_importmap.js.map