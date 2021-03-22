import { memoize } from "lodash"
import vscode from "vscode"

export const vscode_window_createOutputChannel_memo = memoize(
  vscode.window.createOutputChannel
)
