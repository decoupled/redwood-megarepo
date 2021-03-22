// this will be bundled in the preactivator. node_modules will be empty
// import { readJSONSync } from "fs-extra"
import { readFileSync } from "fs"
import { memoize } from "lodash"
import { basename, join } from "path"
import vscode from "vscode"
import { vscode_window_createOutputChannel_memo } from "./vscode_window_createOutputChannel_memo"

export function vscode_window_createOutputChannel_defaultForExtension(
  ctx: vscode.ExtensionContext
) {
  const key = getKeyMemo(ctx)
  return vscode_window_createOutputChannel_memo(key)
}

const getKeyMemo = memoize(getKey)

function getKey(ctx: vscode.ExtensionContext) {
  if (
    ctx.extensionMode === vscode.ExtensionMode.Development ||
    ctx.extensionMode === vscode.ExtensionMode.Test
  ) {
    const pjson = readJSONSync(join(ctx.extensionPath, "package.json"))
    const { publisher, name } = pjson
    return `${publisher}.${name} [mode=dev]`
  } else {
    return basename(ctx.extensionPath)
  }
}

function readJSONSync(p: string) {
  return JSON.parse(readFileSync(p).toString())
}
