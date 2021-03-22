import {
  ensureDirSync,
  existsSync,
  outputJSONSync,
  readJSONSync,
} from "fs-extra"
import { join } from "path"
import vscode from "vscode"
import { Command } from "vscode-languageserver-types"

export function init_hook_activate(ctx: vscode.ExtensionContext) {
  init_hook_run_all()
}

function init_hook_run_all() {
  for (const wf of vscode.workspace.workspaceFolders ?? []) {
    const ff = fff(wf.uri.fsPath)
    if (existsSync(ff)) {
      const cmd: Command = readJSONSync(ff)
      if (Command.is(cmd)) {
        outputJSONSync(ff, {}) // unlinking can be unsafe
        vscode.commands.executeCommand(cmd.command, ...(cmd.arguments ?? []))
      } else {
        //console.log("invalid command in .jamstackide/.init", cmd)
      }
    }
  }
}

export function init_hook_set(dir: string, cmd: Command) {
  ensureDirSync(dir)
  outputJSONSync(fff(dir), cmd)
}

export async function init_hook_set_and_open(
  dir: string,
  cmd: Command,
  openInNewWindow = false
) {
  init_hook_set(dir, cmd)
  const uri = vscode.Uri.file(dir)
  await vscode.commands.executeCommand(
    "vscode.openFolder",
    uri,
    openInNewWindow
  )
  if (!openInNewWindow) {
    // if we opened in the same window, reload so the init hook gets processed
    vscode.commands.executeCommand("workbench.action.reloadWindow")
  }
}

// export function init_hook_get(dir: string): Command | undefined {

// }

function fff(dir: string) {
  return join(dir, ".redwoodjs/vscode-extension/init")
}
