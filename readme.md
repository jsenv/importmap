# jsenv-import-map

> importMap programmatic implementation

[![npm package](https://img.shields.io/github/package-json/v/jsenv/jsenv-import-map.svg?label=package&logo=github)](https://github.com/jsenv/jsenv-import-map/packages)
[![ci status](https://github.com/jsenv/jsenv-import-map/workflows/ci/badge.svg)](https://github.com/jsenv/jsenv-import-map/actions)
[![codecov](https://codecov.io/gh/jsenv/jsenv-import-map/branch/master/graph/badge.svg)](https://codecov.io/gh/jsenv/jsenv-import-map)

## Introduction

`jsenv-import-map` is a javasScript implementation of the importMap specification. It is written using es modules and is compatible with Node.js.<br />

I made this project because jsenv uses importMap but they are not yet available in browsers.<br />

— see [importMap spec](https://github.com/WICG/import-maps)

`@jsenv/import-map` has the following exports:

- [applyImportMap](#applyimportmap)
- [composeTwoImportMaps](#composetwoimportmaps)
- [normalizeImportMap](#normalizeimportmap)
- [resolveImport](#resolveimport)
- [resolveSpecifier](#resolvespecifier)
- [wrapImportMap](#wrapimportmap)

## applyImportMap

> takes { `importMap`, `href`, `importerHref` } and returns either the `href` remapped by `importMap` or the original `href`.

```js
import { applyImportMap } from "@jsenv/import-map"

const href = "http://domain.com/foo"
const importMap = {
  imports: {
    "http://domain.com/foo": "http://domain.com/bar",
  },
}
const hrefRemapped = applyImportMap({
  href,
  importMap,
})
console.log(hrefRemapped)
```

The code above logs `"http://domain.com/bar"`.<br />
The provided `importMap` specifiers must be absolute and sorted to work as expected.<br />
You can use [normalizeImportMap](#normalizeimportmap) to do that.<br />

— see [applyImportMap source code](./src/applyImportMap/applyImportMap.js)

## composeTwoImportMaps

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

## normalizeImportMap

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

## resolveImport

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

## resolveSpecifier

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

## wrapImportMap

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

```console
npm install @jsenv/import-map@5.0.0
```

```console
yarn add @jsenv/import-map@5.0.0
```
