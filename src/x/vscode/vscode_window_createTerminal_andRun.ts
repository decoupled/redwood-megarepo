import * as vscode from "vscode"
export function vscode_window_createTerminal_andRun(
  opts: {
    cmd?: string | string[]
  } & vscode.TerminalOptions
) {
  const { cmd, ...topts } = opts
  const t = vscode.window.createTerminal(topts)
  vscode.commands.executeCommand("workbench.action.terminal.clear")
  t.sendText("clear")
  t.sendText("clear")
  t.show()
  const cmds = Array.isArray(cmd) ? cmd : typeof cmd === "string" ? [cmd] : []
  for (const c of cmds) {
    t.sendText(c)
  }
  return t
}
