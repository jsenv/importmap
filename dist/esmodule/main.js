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
      importer = _ref.importer;
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
    var scopeKeyMatching = Object.keys(scopes).find(function (scopeKey) {
      return scopeKey === importer || specifierIsPrefixOf(scopeKey, importer);
    });

    if (scopeKeyMatching) {
      var scopeValue = scopes[scopeKeyMatching];
      var remappingFromScopeImports = applyImports(specifierNormalized, scopeValue);

      if (remappingFromScopeImports !== null) {
        return remappingFromScopeImports;
      }
    }
  }

  var imports = importMap.imports;

  if (imports) {
    var remappingFromImports = applyImports(specifierNormalized, imports);

    if (remappingFromImports !== null) {
      return remappingFromImports;
    }
  }

  if (specifierUrl) {
    return specifierUrl;
  }

  throw new Error(createDetailedMessage("Unmapped bare specifier.", {
    specifier: specifier,
    importer: importer
  }));
};

var applyImports = function applyImports(specifier, imports) {
  var importKeyArray = Object.keys(imports);
  var i = 0;

  while (i < importKeyArray.length) {
    var importKey = importKeyArray[i];
    i++;

    if (importKey === specifier) {
      var importValue = imports[importKey];
      return importValue;
    }

    if (specifierIsPrefixOf(importKey, specifier)) {
      var _importValue = imports[importKey];
      var afterImportKey = specifier.slice(importKey.length);
      return tryUrlResolution(afterImportKey, _importValue);
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

function _objectSpread (target) {
  for (var i = 1; i < arguments.length; i++) {
    // eslint-disable-next-line prefer-rest-params
    var source = arguments[i] === null ? {} : arguments[i];

    if (i % 2) {
      // eslint-disable-next-line no-loop-func
      ownKeys(Object(source), true).forEach(function (key) {
        defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      // eslint-disable-next-line no-loop-func
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
} // This function is different to "Reflect.ownKeys". The enumerableOnly
// filters on symbol properties only. Returned string properties are always
// enumerable. It is good to use in objectSpread.

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    }); // eslint-disable-next-line prefer-spread

    keys.push.apply(keys, symbols);
  }

  return keys;
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
    importMap.imports = composeTwoImports(leftImports, rightImports);
  } else if (leftHasImports) {
    importMap.imports = _objectSpread({}, leftImports);
  } else if (rightHasImports) {
    importMap.imports = _objectSpread({}, rightImports);
  }

  var leftScopes = leftImportMap.scopes;
  var rightScopes = rightImportMap.scopes;
  var leftHasScopes = Boolean(leftScopes);
  var rightHasScopes = Boolean(rightScopes);

  if (leftHasScopes && rightHasScopes) {
    importMap.scopes = composeTwoScopes(leftScopes, rightScopes, importMap.imports || {});
  } else if (leftHasScopes) {
    importMap.scopes = _objectSpread({}, leftScopes);
  } else if (rightHasScopes) {
    importMap.scopes = _objectSpread({}, rightScopes);
  }

  return importMap;
};

var composeTwoImports = function composeTwoImports(leftImports, rightImports) {
  var topLevelMappings = {};
  Object.keys(leftImports).forEach(function (leftSpecifier) {
    if (objectHasKey(rightImports, leftSpecifier)) {
      // will be overidden
      return;
    }

    var leftAddress = leftImports[leftSpecifier];
    var rightSpecifier = Object.keys(rightImports).find(function (rightSpecifier) {
      return compareAddressAndSpecifier(leftAddress, rightSpecifier);
    });
    topLevelMappings[leftSpecifier] = rightSpecifier ? rightImports[rightSpecifier] : leftAddress;
  });
  Object.keys(rightImports).forEach(function (rightSpecifier) {
    topLevelMappings[rightSpecifier] = rightImports[rightSpecifier];
  });
  return topLevelMappings;
};

var objectHasKey = function objectHasKey(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
};

var compareAddressAndSpecifier = function compareAddressAndSpecifier(address, specifier) {
  var addressUrl = resolveUrl(address, "file:///");
  var specifierUrl = resolveUrl(specifier, "file:///");
  return addressUrl === specifierUrl;
};

var composeTwoScopes = function composeTwoScopes(leftScopes, rightScopes, topLevelRemappings) {
  var scopedRemappings = {};
  Object.keys(leftScopes).forEach(function (leftScopeKey) {
    if (objectHasKey(rightScopes, leftScopeKey)) {
      // will be merged
      scopedRemappings[leftScopeKey] = leftScopes[leftScopeKey];
      return;
    }

    var topLevelSpecifier = Object.keys(topLevelRemappings).find(function (topLevelSpecifierCandidate) {
      return compareAddressAndSpecifier(leftScopeKey, topLevelSpecifierCandidate);
    });

    if (topLevelSpecifier) {
      scopedRemappings[topLevelRemappings[topLevelSpecifier]] = leftScopes[leftScopeKey];
    } else {
      scopedRemappings[leftScopeKey] = leftScopes[leftScopeKey];
    }
  });
  Object.keys(rightScopes).forEach(function (rightScopeKey) {
    if (objectHasKey(scopedRemappings, rightScopeKey)) {
      scopedRemappings[rightScopeKey] = composeTwoImports(scopedRemappings[rightScopeKey], rightScopes[rightScopeKey]);
    } else {
      scopedRemappings[rightScopeKey] = _objectSpread({}, rightScopes[rightScopeKey]);
    }
  });
  return scopedRemappings;
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
    importMapRelative.imports = makeImportsRelativeTo(imports, makeRelativeTo) || imports;
  }

  var scopes = importMap.scopes;

  if (scopes) {
    importMapRelative.scopes = makeScopedRemappingRelativeTo(scopes, makeRelativeTo) || scopes;
  } // nothing changed


  if (importMapRelative.imports === imports && importMapRelative.scopes === scopes) {
    return importMap;
  }

  return importMapRelative;
};

var makeScopedRemappingRelativeTo = function makeScopedRemappingRelativeTo(scopes, makeRelativeTo) {
  var scopesTransformed = {};
  var scopesRemaining = {};
  var transformed = false;
  Object.keys(scopes).forEach(function (scopeKey) {
    var scopeValue = scopes[scopeKey];
    var scopeKeyRelative = makeRelativeTo(scopeKey, "address");
    var scopeValueRelative = makeImportsRelativeTo(scopeValue, makeRelativeTo);

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
  return transformed ? _objectSpread(_objectSpread({}, scopesTransformed), scopesRemaining) : null;
};

var makeImportsRelativeTo = function makeImportsRelativeTo(imports, makeRelativeTo) {
  var importsTransformed = {};
  var importsRemaining = {};
  var transformed = false;
  Object.keys(imports).forEach(function (importKey) {
    var importValue = imports[importKey];
    var importKeyRelative = makeRelativeTo(importKey, "specifier");
    var importValueRelative = makeRelativeTo(importValue, "address");

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
  return transformed ? _objectSpread(_objectSpread({}, importsTransformed), importsRemaining) : null;
};

var sortImportMap = function sortImportMap(importMap) {
  assertImportMap(importMap);
  var imports = importMap.imports,
      scopes = importMap.scopes;
  return _objectSpread(_objectSpread({}, imports ? {
    imports: sortImports(imports)
  } : {}), scopes ? {
    scopes: sortScopes(scopes)
  } : {});
};
var sortImports = function sortImports(imports) {
  var importsSorted = {};
  Object.keys(imports).sort(compareLengthOrLocaleCompare).forEach(function (name) {
    importsSorted[name] = imports[name];
  });
  return importsSorted;
};
var sortScopes = function sortScopes(scopes) {
  var scopesSorted = {};
  Object.keys(scopes).sort(compareLengthOrLocaleCompare).forEach(function (scopeName) {
    scopesSorted[scopeName] = sortImports(scopes[scopeName]);
  });
  return scopesSorted;
};

var compareLengthOrLocaleCompare = function compareLengthOrLocaleCompare(a, b) {
  return b.length - a.length || a.localeCompare(b);
};

var normalizeImportMap = function normalizeImportMap(importMap, baseUrl) {
  assertImportMap(importMap);

  if (typeof baseUrl !== "string") {
    throw new TypeError(formulateBaseUrlMustBeAString({
      baseUrl: baseUrl
    }));
  }

  var imports = importMap.imports,
      scopes = importMap.scopes;
  return {
    imports: imports ? normalizeImports(imports, baseUrl) : undefined,
    scopes: scopes ? normalizeScopes(scopes, baseUrl) : undefined
  };
};

var normalizeImports = function normalizeImports(imports, baseUrl) {
  var importsNormalized = {};
  Object.keys(imports).forEach(function (specifier) {
    var address = imports[specifier];

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

    importsNormalized[specifierResolved] = addressUrl;
  });
  return sortImports(importsNormalized);
};

var normalizeScopes = function normalizeScopes(scopes, baseUrl) {
  var scopesNormalized = {};
  Object.keys(scopes).forEach(function (scope) {
    var scopeValue = scopes[scope];
    var scopeUrl = tryUrlResolution(scope, baseUrl);

    if (scopeUrl === null) {
      console.warn(formulateScopeResolutionFailed({
        scope: scope,
        baseUrl: baseUrl
      }));
      return;
    }

    var scopeValueNormalized = normalizeImports(scopeValue, baseUrl);
    scopesNormalized[scopeUrl] = scopeValueNormalized;
  });
  return sortScopes(scopesNormalized);
};

var formulateBaseUrlMustBeAString = function formulateBaseUrlMustBeAString(_ref) {
  var baseUrl = _ref.baseUrl;
  return "baseUrl must be a string.\n--- base url ---\n".concat(baseUrl);
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
      defaultExtension = _ref$defaultExtension === void 0 ? true : _ref$defaultExtension;
  return applyDefaultExtension({
    url: importMap ? applyImportMap({
      importMap: importMap,
      specifier: specifier,
      importer: importer
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

//# sourceMappingURL=main.js.map