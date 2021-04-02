import { groupBy } from "lodash"
import { Decoration } from "src/structure/ide"
import * as vscode from "vscode"
import { DecorationType, decoration_types } from "./decoration_types"

export type DecorationProvider = (uri: vscode.Uri) => Promise<Decoration[]>

export function decorations_activate(
  ctx: vscode.ExtensionContext,
  provider: DecorationProvider
) {
  new Decorations(provider).start()
}

class Decorations {
  constructor(public provider: DecorationProvider) {}

  start() {
    setInterval(() => {
      this.updateDecorations()
    }, 300)
  }

  private async updateDecorationsForEditor(editor: vscode.TextEditor) {
    const { document } = editor
    const { uri } = document
    if (uri.scheme !== "file") {
      return
    }
    const decs = await this.provider(uri)
    // const info = (await this.lspClient.client?.getInfo(uri.toString())) ?? []
    // const decs: { location: LSPLocation; style: string }[] = info.filter(
    //   (i) => i.kind === "Decoration"
    // )
    const grouped = groupBy(decs, (d) => d.style)
    const decorationTypes = decoration_types // decoration_types()
    for (const style of Object.keys(grouped)) {
      const dt = decorationTypes[style as DecorationType]
      if (!dt) {
        throw new Error(`decoration type/style not found: ${style}`)
      }
      const lspRanges = grouped[style].map((s) => s.location.range)
      const vscRanges = lspRanges.map(
        (r) =>
          new vscode.Range(
            r.start.line,
            r.start.character,
            r.end.line,
            r.end.character
          )
      )
      editor.setDecorations(dt, vscRanges)
    }
  }
  private updateDecorations() {
    const { activeTextEditor } = vscode.window
    if (!activeTextEditor) {
      return
    }
    this.updateDecorationsForEditor(activeTextEditor)
  }
}
