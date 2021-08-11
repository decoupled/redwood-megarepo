import { keep, VSCodeExtension } from "lambdragon"
import { join } from "path"
import { language_server } from "src/language_server/language_server"
import vscode from "vscode"
import { redwoodjs_vsc } from "./redwoodjs_vsc"
import icon from "./static/redwoodjs_vscode_icon.png"
import * as mobx from "mobx"
import * as fpts from "fp-ts"

// the build target for the extension
export const redwoodVSCodeExtension = new VSCodeExtension({
  main,
  activationEvents: ["*"],
  publisher: "decoupled",
  name: "redwood-kaimana",
  version: "0.0.2",
  displayName: "redwood-kaimana",
  description: "redwood-kaimana",
  categories: ["Other"],
  repository: "https://github.com/decoupled/redwood-megarepo",
  icon,
  deps: [language_server],
  staticDir: join(__dirname, "static"),
})

// the entrypoint
function main() {
  keep(fpts)
  mobx.configure({ enforceActions: "never" })
  return {
    activate(ctx: vscode.ExtensionContext) {
      redwoodjs_vsc(ctx)
    },
    deactivate() {},
  }
}
