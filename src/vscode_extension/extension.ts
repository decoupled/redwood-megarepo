import { VSCodeExtension } from "lambdragon"
import { join } from "path"
import { language_server } from "src/language_server/language_server"
import vscode from "vscode"
import { redwoodjs_vsc } from "./redwoodjs_vsc"
import icon from "./static/redwoodjs_vscode_icon.png"

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
  engines: { vscode: "^1.57.1" },
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
