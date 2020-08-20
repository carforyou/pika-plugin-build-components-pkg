# CAR FOR YOU pika plugin to build React component libraries

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> A [@pika/pack](https://github.com/pikapkg/pack) build plugin.

Adds a Node.js distribution as well as a web distribution. Supports CSS modules.

## Installation
```
npm install @carforyou/pika-plugin-build-components
```

## Usage

```json
{
  "name": "example-pkg",
  "version": "1.0.0",
  "@pika/pack": {
    "pipeline": [
      ["@pika/plugin-standard-pkg"],
      ["@carforyou/pika-plugin-build-components"]
    ]
  }
}
```

Only works with `@pika/plugin-ts-standard-pkg` as it currently relies on typescript to write the source file.
In your `tsconfig.pika.json`, include the separate source `node.ts`:
```
"include": ["src/index.ts", "src/node.ts"],
```

Add your node-specific code to `src/node.ts`.

For more information about @pika/pack & help getting started, [check out the main project repo](https://github.com/pikapkg/pack).


## Options

- `"sourcemap"` (Default: `"true"`): Adds a [source map](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) for this build.
- `"minNodeVersion"` (Default: `"8"`): This plugin will build your package for the current minimum [Node.js LTS](https://github.com/nodejs/Release) major version. This option allows you to target later versions of Node.js only.

## Result

1. Adds a Node.js distribution to your built package: `dist-node/index.js` based on `dist-src/node.ts`. Adds a "main" entrypoint to your built `package.json` manifest.
1. Adds a web distribution to your built package: `dist-node/index.js` based on `dist-src/index.ts`. Adds a "module" entrypoint to your built `package.json` manifest.


## Development
```
npm run build
```

You can link your local npm package to integrate it with any local project:
```
cd pika-plugin-build-components-pkg
npm run build

cd carforyou-listings-web
npm link ../pika-plugin-build-components-pkg/pkg
```

## Release a new version

Releasing is done using semantic release on the ci after merging into the default branch.

