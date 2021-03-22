import vscode from "vscode"
import { init_hook_activate } from "./init_hook"
import {
  commands,
  Opts,
  FromCommandInvocation,
  develop_locally,
  hideAll,
} from "./develop_locally"
import { NewJamstackProjectSourceString } from "../util/NewJamstackProjectSource"

let activated = false
export function develop_locally_command_activate(ctx: vscode.ExtensionContext) {
  if (activated) return
  activated = true
  init_hook_activate(ctx)
  vscode.commands.registerCommand(
    commands.develop_locally.command,
    (opts?: NewJamstackProjectSourceString | Opts) => {
      const opts2 =
        typeof opts === "object"
          ? opts
          : ({
              action: "FromCommandInvocation",
              sourceStr: opts,
            } as FromCommandInvocation)
      develop_locally(opts2, ctx)
    }
  )
  vscode.commands.registerCommand(commands._sandbox.command, () => {
    hideAll()
  })
}
