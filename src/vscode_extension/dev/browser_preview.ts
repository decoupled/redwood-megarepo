import vscode from "vscode"
export async function browser_preview(url: string, debug = false) {
  if (debug) {
    const cfc = {
      type: "browser-preview",
      request: "launch",
      name: "Browser Preview",
      url,
    }
    return await vscode.debug.startDebugging(undefined, cfc)
  } else {
    const pv = await vscode.commands.executeCommand(
      "browser-preview.openPreview",
      url
    )
  }
}
