# import-map

Helpers to implement importMap.

[![github package](https://img.shields.io/github/package-json/v/jsenv/jsenv-import-map.svg?logo=github&label=package)](https://github.com/jsenv/jsenv-import-map/packages)
[![npm package](https://img.shields.io/npm/v/@jsenv/import-map.svg?logo=npm&label=package)](https://www.npmjs.com/package/@jsenv/import-map)
[![github ci](https://github.com/jsenv/jsenv-import-map/workflows/ci/badge.svg)](https://github.com/jsenv/jsenv-import-map/actions?workflow=ci)
[![codecov coverage](https://codecov.io/gh/jsenv/jsenv-import-map/branch/master/graph/badge.svg)](https://codecov.io/gh/jsenv/jsenv-import-map)

# Table of contents

- [Presentation](#Presentation)
- [Installation](#installation)
- [Documentation](#Usage)
  - [composeTwoImportMaps](#composetwoimportmaps)
  - [normalizeImportMap](#normalizeimportmap)
  - [resolveImport](#resolveimport)

# Presentation

`@jsenv/import-map` can be used to implement the behaviour of importMap as described in the specification. It is written using es modules and is compatible with Node.js.

— see [importMap spec](https://github.com/WICG/import-maps)

# Installation

```console
npm install --save-dev @jsenv/import-map@6.7.0
```

# Documentation

`@jsenv/import-map` exports are documented in this section.

## composeTwoImportMaps

 `composeTwoImportMaps` takes two `importMap` and return a single `importMap` being the composition of the two.

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

— source code at [src/composeTwoImportMaps.js](./src/composeTwoImportMaps.js).

## normalizeImportMap

`normalizeImportMap` returns an `importMap` resolved against an `url` and sorted.

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

— source code at [src/normalizeImportMap.js](./src/normalizeImportMap.js).

## resolveImport

`resolveImport` returns an import `url` applying an `importMap` to `specifier` and `importer`. The provided `importMap` must be resolved and sorted to work as expected. You can use [normalizeImportMap](#normalizeimportmap) to do that.

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

— source code at [src/resolveImport.js](./src/resolveImport.js).
