# jsenv-import-map

[![github package](https://img.shields.io/github/package-json/v/jsenv/jsenv-import-map.svg?logo=github&label=package)](https://github.com/jsenv/jsenv-import-map/packages)
[![npm package](https://img.shields.io/npm/v/@jsenv/import-map.svg?logo=npm&label=package)](https://www.npmjs.com/package/@jsenv/import-map)
[![github ci](https://github.com/jsenv/jsenv-import-map/workflows/ci/badge.svg)](https://github.com/jsenv/jsenv-import-map/actions?workflow=ci)
[![codecov coverage](https://codecov.io/gh/jsenv/jsenv-import-map/branch/master/graph/badge.svg)](https://codecov.io/gh/jsenv/jsenv-import-map)

## Table of contents

- [Presentation](#Presentation)
- [Usage](#Usage)
  - [composeTwoImportMaps](#composetwoimportmaps)
  - [normalizeImportMap](#normalizeimportmap)
  - [resolveImport](#resolveimport)
- [Installation](#installation)

## Presentation

`@jsenv/import-map` can be used to implement the behaviour of importMap as described in the specification. It is written using es modules and is compatible with Node.js.<br />

— see [importMap spec](https://github.com/WICG/import-maps)

## Usage

`@jsenv/import-map` exports are documented in this section.

### composeTwoImportMaps

> `composeTwoImportMaps` takes two `importMap` and return a single `importMap` being the composition of the two.<br />
> Implemented by [src/composeTwoImportMaps/composeTwoImportMaps.js](src/composeTwoImportMaps/composeTwoImportMaps.js)

```js
import { composeTwoImportMaps } from "@jsenv/import-map"

const importMap = composeTwoImportMaps(
  {
    imports: {
      foo: "bar",
    },
  },
  {
    imports: {
      foo: "whatever",
    },
  },
)

console.log(JSON.stringify(importMap, null, "  "))
```

```console
{
  "imports": {
    "foo": "whatever"
  }
}
```

### normalizeImportMap

> `normalizeImportMap` returns an `importMap` resolved against an `url` and sorted.<br />
> Implemented by [src/normalizeImportMap/normalizeImportMap.js](src/normalizeImportMap/normalizeImportMap.js)

```js
import { normalizeImportMap } from "@jsenv/import-map"

const importMap = normalizeImportMap(
  {
    imports: {
      foo: "./bar",
      "./ding.js": "./dong.js"
    },
  },
  "http://your-domain.com",
)

console.log(JSON.stringify(importMap, null, '  ')
```

```console
{
  "imports": {
    "foo": "http://your-domain.com/bar",
    "http://your-domain.com/ding.js": "http://your-domain.com/dong.js"
  }
}
```

### resolveImport

> `resolveImport` returns an import `url` applying an `importMap` to `specifier` and `importer`.<br />
> Implemented by [src/resolveImport/resolveImport.js](src/resolveImport/resolveImport.js)

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

```console
http://domain.com/main.js
```

The provided `importMap` must be resolved and sorted to work as expected. You can use [normalizeImportMap](#normalizeimportmap) to do that.<br />

## Installation

If you never installed a jsenv package, read [Installing a jsenv package](https://github.com/jsenv/jsenv-core/blob/master/docs/installing-jsenv-package.md#installing-a-jsenv-package) before going further.

This documentation is up-to-date with a specific version so prefer any of the following commands

```console
npm install --save-dev @jsenv/import-map@6.2.0
```

```console
yarn add --dev @jsenv/import-map@6.2.0
```
