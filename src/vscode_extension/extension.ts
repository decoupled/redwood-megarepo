import { VSCodeExtension } from "lambdragon"
import { join } from "path"
import { language_server } from "src/language_server/language_server"
import vscode from "vscode"
import merge from "webpack-merge"
import { commands_contributes } from "./commands/commands"
import { lsp_treeview_contributes } from "./treeview/outline/consts"
import { redwoodjs_vsc } from "./redwoodjs_vsc"
import icon from "./static/redwoodjs_logo.svg"
import { treeview_docs_contributes } from "./treeview/docs/treeview_docs"
import { treeview_workflow_contributes } from "./treeview/workflow/treeview_workflow"

// the build target for the extension
export const redwoodVSCodeExtension = new VSCodeExtension({
  main,
  activationEvents: ["*"],
  publisher: "redwoodjs",
  name: "redwood",
  version: "0.0.22",
  displayName: "Redwood IDE",
  description: "Redwood IDE",
  categories: ["Other"],
  icon,
  contributes: contributes() as any,
  engines: { vscode: "^1.53.0" },
  deps: [language_server],
  staticDir: join(__dirname, "static"),
})

// the entrypoint
function main() {
  return {
    activate(ctx: vscode.ExtensionContext) {
      redwoodjs_vsc(ctx)
    },
    deactivate() {},
  }
}

function contributes() {
  return merge([
    commands_contributes().contributes,
    lsp_treeview_contributes().contributes,
    treeview_workflow_contributes().contributes,
    treeview_docs_contributes().contributes,
  ])
}

{
  contributes()
}
