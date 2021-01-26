import postcss from "rollup-plugin-postcss"
import rollupBabel from "rollup-plugin-babel"
import { rollup, WarningHandlerWithDefault } from "rollup"
import path from "path"
import builtinModules from "builtin-modules"
import babelPluginDynamicImport from "babel-plugin-dynamic-import-node-babel-7"
import { BuilderOptions } from "@pika/types"
import babelPresetEnv from "@babel/preset-env"
import babelPluginImportMetaSyntax from "@babel/plugin-syntax-import-meta"
import babelPluginDynamicImportSyntax from "@babel/plugin-syntax-dynamic-import"
import babelPluginOptionalChaining from "@babel/plugin-syntax-optional-chaining"

const defaultMinNodeVersion = 8
const postcssPlugin = () => {
  return postcss({
    extract: false,
    modules: true,
  })
}

// copy of https://www.npmjs.com/package/@pika/plugin-build-web
// with additional rollup plugins
export async function webBuild({
  out,
  options,
  reporter,
}: BuilderOptions): Promise<void> {
  const writeToWeb = path.join(out, "dist-web", "index.js")

  const result = await rollup({
    input: path.join(out, "dist-src/index.js"),
    plugins: [postcssPlugin()],
    onwarn: ((warning, defaultOnWarnHandler) => {
      // Unresolved external imports are expected
      if (
        warning.code === "UNRESOLVED_IMPORT" &&
        !(warning.source.startsWith("./") || warning.source.startsWith("../"))
      ) {
        return
      }
      defaultOnWarnHandler(warning)
    }) as WarningHandlerWithDefault,
  })

  await result.write({
    file: writeToWeb,
    format: "esm",
    exports: "named",
    sourcemap: options.sourcemap === undefined ? true : options.sourcemap,
  })
  reporter.created(writeToWeb, "module")
}

// copy of https://www.npmjs.com/package/@pika/plugin-build-node
// with additional rollup plugins
export async function nodeBuild({
  out,
  reporter,
  options,
}: BuilderOptions): Promise<void> {
  const outFile = path.join(out, "dist-node", "index.js")
  const srcFile = path.join(out, "dist-src", "node.js")

  const result = await rollup({
    input: srcFile,
    external: builtinModules as string[],
    plugins: [
      postcssPlugin(),
      rollupBabel({
        babelrc: false,
        compact: false,
        presets: [
          [
            babelPresetEnv,
            {
              modules: false,
              targets: {
                node: options.minNodeVersion || defaultMinNodeVersion,
              },
              spec: true,
            },
          ],
        ],
        plugins: [
          babelPluginDynamicImport,
          babelPluginDynamicImportSyntax,
          babelPluginImportMetaSyntax,
          babelPluginOptionalChaining
        ],
      }),
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
    }) as WarningHandlerWithDefault,
  })

  await result.write({
    file: outFile,
    format: "cjs",
    exports: "named",
    sourcemap: options.sourcemap === undefined ? true : options.sourcemap,
  })
  reporter.created(outFile, "main")
}
