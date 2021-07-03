import vscode from "vscode"
import { ids } from "../util/ids"
import { simple_watcher } from "../util/simple_watcher"
import { contributor_mode_find_dir } from "./contributor_mode_detect"
import { contributor_view_activate } from "./views/contributor/contributor_view"

export function contributor_mode_activate(ctx: vscode.ExtensionContext): void {
  const dd = simple_watcher(contributor_mode_find_dir, (dir) => {
    const si = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    )
    si.text = "Redwood.js Contributor"
    si.show()
    contributor_mode_enabled_set(true)
    return {
      dispose() {
        si.dispose()
        contributor_mode_enabled_set(false)
      },
    }
  })
  ctx.subscriptions.push({
    dispose() {
      dd.dispose()
      contributor_mode_enabled_set(false)
    },
  })

  contributor_view_activate(ctx)
}


function contributor_mode_enabled_set(v: boolean) {
  vscode.commands.executeCommand(
    "setContext",
    ids.redwoodjs.flags.contributor_mode_enabled.$id,
    v
  )
}
