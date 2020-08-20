import path from "path"
import fs from "fs"
import { MessageError } from "@pika/types"

export function nodeBeforeJob(srcDir: string) {
  const srcFile = path.join(srcDir, "node.js")

  if (!fs.existsSync(srcDir)) {
    throw new MessageError(
      `${srcDir} does not exist, or was not yet created in the pipeline.`
    )
  }
  if (!fs.existsSync(srcFile)) {
    throw new MessageError(
      `"${srcFile}" is the expected entrypoint, but it does not exist.`
    )
  }
}
