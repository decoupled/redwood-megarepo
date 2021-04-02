import vscode from "vscode"
import { NewJamstackProjectSourceString } from "../util/NewJamstackProjectSource"
import {
  commands,

  
  develop_locally, FromCommandInvocation, Opts
} from "./develop_locally"
import { init_hook_activate } from "./init_hook"

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

}
