import { parse } from "querystring"
import vscode from "vscode"
import { vscode_window_createOutputChannel_defaultForExtension } from "src/x/vscode/vscode_window_createOutputChannel_defaultForExtension"
import { vscode_window_registerUriHandler_multi } from "src/x/vscode/vscode_window_registerUriHandler_multi"
import { develop_locally, ExtraOpts } from "../dev/develop_locally"

// vscode://decoupled.jamstackide/open?source=netlify-templates/next-starter-jamstack
// vscode://decoupled.redwoodjs-ide/open?source=netlify-templates/next-starter-jamstack
// vscode://decoupled.redwoodjs-ide/open?framework=redwood&open=web%2Fsrc%2FRoutes.js&source=create-redwood-app
export function magic_urls(ctx: vscode.ExtensionContext) {
  const oc = vscode_window_createOutputChannel_defaultForExtension(ctx)
  vscode_window_registerUriHandler_multi({
    handleUri(uri: vscode.Uri) {
      const msg = `handleUri("${uri.toString()}")`
      oc.appendLine(msg)
      console.log(msg)
      if (uri.path !== "/open") return
      const q = parse(uri.query)
      const source = str(q["source"])
      const open = str(q["open"])
      const framework = str(q["framework"])
      const command = str(q["command"])
      const install = str(q["install"])
      const degit = str(q["degit"]) === "true"
      const extraOpts: ExtraOpts = { open, framework, command, install, degit }
      develop_locally({ action: "FromMagicURL", source, extraOpts }, ctx)
    },
  })
}

function str(x: string | string[] | undefined): string | undefined {
  if (Array.isArray(x)) return x[0]
  if (typeof x !== "string") return undefined
  return x
}
