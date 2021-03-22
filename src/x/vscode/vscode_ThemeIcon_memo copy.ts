import vscode from "vscode"
import { memoize } from "lodash"

export const vscode_ThemeIcon_memo = memoize((id: string) => {
  // for some reason, the vscode.ThemeIcon is now private
  return new (vscode.ThemeIcon as any)(id) as vscode.ThemeIcon
})
