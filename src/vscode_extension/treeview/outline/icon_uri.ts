import { join } from "path"

import vscode from "vscode"

import { icon_rel_path } from "./icon_rel_path"

export function icon_uri(name: string, ctx: vscode.ExtensionContext) {
  return vscode.Uri.file(join(ctx.extensionPath, icon_rel_path(name)))
}
