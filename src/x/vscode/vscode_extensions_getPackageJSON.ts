import { readFileSync } from "fs"
import { join } from "path"

import { memoize } from "lodash"
import vscode from "vscode"

export function vscode_extensions_getPackageJSON(
  ctx: vscode.ExtensionContext
): any {
  return memoized(ctx)
}

const memoized = memoize((ctx: vscode.ExtensionContext) => {
  return readJSONSync(join(ctx.extensionPath, "package.json"))
})

function readJSONSync(p: string) {
  return JSON.parse(readFileSync(p).toString())
}
