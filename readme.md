# jsenv-import-map

[![github package](https://img.shields.io/github/package-json/v/jsenv/jsenv-import-map.svg?label=package&logo=github)](https://github.com/jsenv/jsenv-import-map/packages)
[![workflow status](https://github.com/jsenv/jsenv-node-module-import-map/workflows/continuous%20testing/badge.svg)](https://github.com/jsenv/jsenv-node-module-import-map/actions?workflow=continuous+testing)
[![codecov](https://codecov.io/gh/jsenv/jsenv-import-map/branch/master/graph/badge.svg)](https://codecov.io/gh/jsenv/jsenv-import-map)

## Introduction

`@jsenv/import-map` can be used to implement the behaviour of importMap as described in the specification. It is written using es modules and is compatible with Node.js.<br />

I made this project because jsenv uses importMap but they are not yet available in browsers.<br />

— see [importMap spec](https://github.com/WICG/import-maps)

## Table of contents

- [api](#api)
  - [applyImportMap](#applyimportmap)
  - [composeTwoImportMaps](#composetwoimportmaps)
  - [normalizeImportMap](#normalizeimportmap)
  - [resolveImport](#resolveimport)
  - [resolveSpecifier](#resolvespecifier)
  - [wrapImportMap](#wrapimportmap)
- [Installation](#installation)

## api

`@jsenv/import-map` exports are documented in this section.

### applyImportMap

> takes { `importMap`, `href`, `importerHref` } and returns either the `href` remapped by `importMap` or the original `href`.

```js
import { applyImportMap } from "@jsenv/import-map"

const specifier = "http://domain.com/foo"
const importMap = {
  imports: {
    "http://domain.com/foo": "http://domain.com/bar",
  },
}
const hrefRemapped = applyImportMap({
  specifier,
  importMap,
})
console.log(hrefRemapped)
```

The code above logs `"http://domain.com/bar"`.<br />
The provided `importMap` specifiers must be absolute and sorted to work as expected.<br />
You can use [normalizeImportMap](#normalizeimportmap) to do that.<br />

— see [applyImportMap source code](./src/applyImportMap/applyImportMap.js)

### composeTwoImportMaps

> takes (`leftImportMap`, `rightImportMap`) and returns an importMap being the composition of the two.

```js
import { composeTwoImportMaps } from "@jsenv/import-map"

const leftImportMap = {
  imports: {
    foo: "bar",
  },
}
const rightImportMap = {
  imports: {
    foo: "whatever",
  },
}
const importMap = composeTwoImportMaps(leftImportMap, rightImportMap)

console.log(importMap.imports.foo)
```

The code above logs `"whatever"`.

— see [composeTwoImportMaps source code](./src/composeTwoImportMaps/composeTwoImportMaps.js)

### normalizeImportMap

> takes (`importMap`, `href`) and returns an importMap where relative specifier are resolved against `href` and sorted.

```js
import { normalizeImportMap } from "@jsenv/import-map"

const importMap = {
  imports: {
    foo: "http://cdndomain.com/bar",
  },
}
const href = "http://mydomain.com"
const importMapNormalized = normalizeImportMap(importMap, href)

console.log(importMapNormalized.imports["http://mydomain.com/foo"])
```

The code above logs `"http://cdndomain.com/bar"`.

— see [normalizeImportMap source code](./src/normalizeImportMap/normalizeImportMap.js)

### resolveImport

> takes { `specifier`, `importer`, `importMap`, `defaultExtension` } and returns a url.

```js
import { resolveImport } from "@jsenv/import-map"

const importUrl = resolveImport({
  specifier: "../index.js",
  importer: "http://domain.com/folder/file.js",
  importMap: {
    imports: {
      "http://domain.com/index.js": "http://domain.com/main.js",
    },
  },
})

console.log(importUrl)
```

The code above logs `"http://domain.com/main.js"`.

— see [resolveImport source code](./src/resolveImport/resolveImport.js)

### resolveSpecifier

> takes (`specifier`, `importer`) and returns `specifier` resolved against `importer`.

```js
import { resolveSpecifier } from "@jsenv/import-map"

const specifier = "../file.js"
const importer = "http://mydomain.com/folder/index.js"
const specifierResolved = resolveSpecifier(specifier, importer)

console.log(specifierResolved)
```

The code above logs `"http://mydomain.com/file.js"`.

— see [resolveSpecifier source code](./src/resolveSpecifier/resolveSpecifier.js)

### wrapImportMap

> takes (`importMap`, `folderRelativeName`) and returns an importMap wrapped inside `folderRelativeName`.

```js
import { wrapImportMap } from "@jsenv/import-map"

const importMap = {
  imports: {
    foo: "bar",
  },
}
const folderRelativeName = "/dist"
const importMapWrapped = wrapImportMap(specifier, importer)

console.log(importMapWrapped.imports.foo)
```

The code above logs `"/dist/bar"`.<br />
This feature is not part of the spec but is usefull to redirect your imports inside a given folder.<br />

— see [wrapImportMap source code](./src/wrapImportMap/wrapImportMap.js)

## Installation

If you never installed a jsenv package, read [Installing a jsenv package](https://github.com/jsenv/jsenv-core/blob/master/docs/installing-jsenv-package.md#installing-a-jsenv-package) before going further.

This documentation is up-to-date with a specific version so prefer any of the following commands

```console
npm install --save-dev @jsenv/import-map@5.8.2
```

```console
yarn add --dev @jsenv/import-map@5.8.2
```
