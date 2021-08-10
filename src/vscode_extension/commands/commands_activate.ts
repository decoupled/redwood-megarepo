import vscode from "vscode"
import { ids } from "../util/ids"
import { commands_generate, commands_show_outline } from "./commands"
import { debug_activate } from "./debug"

export function commands_activate(ctx: vscode.ExtensionContext): void {
  ctx.subscriptions.push(
    commands_generate.register(async () => {
      vscode.commands.executeCommand(ids.redwoodjs.cli.$id, "generate...")
    }),
    commands_show_outline.register(async () => {
      // TODO: reveal outline
    })
  )
  debug_activate(ctx)
}
