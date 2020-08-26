import path from "path"
import copyfiles from "copyfiles"
import { BuilderOptions } from "@pika/types"
import {
  manifest as webManifest,
  beforeJob as webBeforeJob
} from "@pika/plugin-build-web"
import { manifest as nodeManifest } from "@pika/plugin-build-node"

import { nodeBuild, webBuild } from "./build"
import { nodeBeforeJob } from "./beforeJob"

export function manifest(manif, builderOptions: BuilderOptions) {
  webManifest(manif, { ...builderOptions, options: { entrypoint: "module" } })
  nodeManifest(manif, builderOptions)
}

export async function beforeBuild(options: BuilderOptions) {
  // tsc ignores module.css files - copy them to pkg/dist-src manually
  return new Promise((resolve, reject) => {
    copyfiles(
      ["src/**/*.module.css", "pkg/dist-src"],
      { up: 1, follow: true, error: true },
      (err, res) => {
        if (err) {
          reject(err)
        }
        resolve(res)
      }
    )
  })
}

export async function beforeJob(options: BuilderOptions) {
  const { out } = options

  await webBeforeJob(options)
  await nodeBeforeJob(path.join(out, "dist-src"))
}

export async function afterJob(options: BuilderOptions) {
  const { out } = options
  const srcDir = path.join(out, "dist-src")

  await webBeforeJob(options)
  await nodeBeforeJob(srcDir)
}

export async function build(builderOptions: BuilderOptions): Promise<void> {
  await webBuild(builderOptions)
  await nodeBuild(builderOptions)
}
