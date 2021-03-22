import vscode from "vscode"
import { vscode_window_createTerminal_andRun } from "./vscode_window_createTerminal_andRun"
import { shell_wrapper_run_or_fail } from "./Terminal/shell_wrapper/shell_wrapper_run"

export function vscode_run(
  opts: {
    cmd: string
  } & vscode.TerminalOptions
) {
  return shell_wrapper_run_or_fail(opts.cmd, wrapped_cmd => {
    vscode_window_createTerminal_andRun({ ...opts, cmd: wrapped_cmd })
  })
}
