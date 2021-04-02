import { parse } from "querystring"
import vscode from "vscode"
import { vscode_window_createOutputChannel_defaultForExtension } from "src/x/vscode/vscode_window_createOutputChannel_defaultForExtension"
import { vscode_window_registerUriHandler_multi } from "src/x/vscode/vscode_window_registerUriHandler_multi"
import { develop_locally, ExtraOpts } from "../dev/develop_locally"

export function magic_urls_activate(ctx: vscode.ExtensionContext) {
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
      const command = str(q["command"])
      const install = str(q["install"])
      const degit = str(q["degit"]) === "true"
      const extraOpts: ExtraOpts = {
        open,
        framework: "redwood",
        command,
        install,
        degit,
      }
      develop_locally({ action: "FromMagicURL", source, extraOpts }, ctx)
    },
  })
}

function str(x: string | string[] | undefined): string | undefined {
  if (Array.isArray(x)) return x[0]
  if (typeof x !== "string") return undefined
  return x
}
