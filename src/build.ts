import path from "path"
import { rollup } from "rollup"
import { BuilderOptions } from "@pika/types"
import babelPluginDynamicImportSyntax from "@babel/plugin-syntax-dynamic-import"
import babelPluginImportMetaSyntax from "@babel/plugin-syntax-import-meta"
import babelPresetEnv from "@babel/preset-env"
import babelPluginDynamicImport from "babel-plugin-dynamic-import-node-babel-7"
import builtinModules from "builtin-modules"
import rollupBabel from "rollup-plugin-babel"
import smartAsset from "rollup-plugin-smart-asset"

const DEFAULT_MIN_NODE_VERSION = 8
const cssModulesTransformPlugin = [
  "css-modules-transform",
  { keepImport: true, extensions: [".module.css"] }
  // todo: classes are properly included in the build - but what about the css?
  // smart-assets anyway?
]
const smartAssetPlugin = (rebasePath) => smartAsset({include: "**/*.module.css", keepImport: true, url: "rebase", rebasePath})

// copy of https://www.npmjs.com/package/@pika/plugin-build-web
// with additional rollup plugins
export async function webBuild({
  out,
  options,
  reporter
}: BuilderOptions): Promise<void> {
  const writeToWeb = path.join(out, "dist-web", "index.js")

  console.log("xxx", path.join(out, "dist-src"))
  const result = await rollup({
    input: path.join(out, "dist-src/index.js"),
    plugins: [
      smartAssetPlugin(path.join(out, "dist-src")),
      rollupBabel({
        babelrc: false,
        compact: false,
        // plugins: []
        // plugins: [cssModulesTransformPlugin]
      })
    ],
    onwarn: ((warning, defaultOnWarnHandler) => {
      // // Unresolved external imports are expected
      if (
        warning.code === "UNRESOLVED_IMPORT" &&
        !(warning.source.startsWith("./") || warning.source.startsWith("../"))
      ) {
        return
      }
      defaultOnWarnHandler(warning)
    }) as any
  })

  await result.write({
    file: writeToWeb,
    format: "esm",
    exports: "named",
    sourcemap: options.sourcemap === undefined ? true : options.sourcemap
  })
  reporter.created(writeToWeb, "module")
}

// copy of https://www.npmjs.com/package/@pika/plugin-build-node
// with additional rollup plugins
export async function nodeBuild({
  out,
  reporter,
  options
}: BuilderOptions): Promise<void> {
  const outFile = path.join(out, "dist-node", "index.js")
  const srcFile = path.join(out, "dist-src", "node.js")

  console.log(path.join(out, "dist-src"))
  const result = await rollup({
    input: srcFile,
    external: builtinModules as string[],
    plugins: [
      smartAssetPlugin(path.join(out, "dist-src")),
      rollupBabel({
        babelrc: false,
        compact: false,
        presets: [
          [
            babelPresetEnv,
            {
              modules: false,
              targets: {
                node: options.minNodeVersion || DEFAULT_MIN_NODE_VERSION
              },
              spec: true
            }
          ]
        ],
        plugins: [
          // cssModulesTransformPlugin,
          babelPluginDynamicImport,
          babelPluginDynamicImportSyntax,
          babelPluginImportMetaSyntax
        ]
      })
    ],
    onwarn: ((warning, defaultOnWarnHandler) => {
      // Unresolved external imports are expected
      if (
        warning.code === "UNRESOLVED_IMPORT" &&
        !(warning.source.startsWith("./") || warning.source.startsWith("../"))
      ) {
        return
      }
      defaultOnWarnHandler(warning)
    }) as any
  })

  await result.write({
    file: outFile,
    format: "cjs",
    exports: "named",
    sourcemap: options.sourcemap === undefined ? true : options.sourcemap
  })
  reporter.created(outFile, "main")
}
