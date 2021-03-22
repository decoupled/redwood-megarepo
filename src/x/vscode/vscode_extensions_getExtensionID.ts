import { memoize } from "lodash"
import vscode from "vscode"

import { vscode_extensions_getPackageJSON } from "./vscode_extensions_getPackageJSON"

export function vscode_extensions_getExtensionID(
  ctx: vscode.ExtensionContext
): string {
  return memoized(ctx)
}

const memoized = memoize((ctx: vscode.ExtensionContext) => {
  const { publisher, name } = vscode_extensions_getPackageJSON(ctx)
  return `${publisher}.${name}`
})
