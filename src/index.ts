import path from "path"
import cpy from "cpy"
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

export async function beforeJob(options: BuilderOptions) {
  const { out } = options
  const srcDir = path.join(out, "dist-src")

  await webBeforeJob(options)
  await nodeBeforeJob(srcDir)

  // tsc ignores module.css files - copy them to pkg/dist-src manually
  await cpy([`${path.join(out, "../**/*.module.css")}`], srcDir)
}

export async function build(builderOptions: BuilderOptions): Promise<void> {
  await webBuild(builderOptions)
  await nodeBuild(builderOptions)
}
