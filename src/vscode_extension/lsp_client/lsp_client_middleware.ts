import { memoize } from "lodash"
import { join } from "path"
import { puppeteer_get_thumb } from "src/x/puppeteer/puppeteer_get_thumb"
import vscode from "vscode"
import { LanguageClientOptions } from "vscode-languageclient/node"

export function lsp_client_middleware(
  ctx: vscode.ExtensionContext
): LanguageClientOptions["middleware"] {
  return {
    async provideHover(document, position, token, next) {
      let result = await next(document, position, token)
      result = await vscode_Hover_addThumbnails(result, ctx)
      return result
    },
  }
}

async function vscode_Hover_addThumbnails(
  hover: vscode.Hover,
  ctx: vscode.ExtensionContext
): Promise<vscode.Hover> {
  const contents = await Promise.all(
    hover.contents.map((x) => vscode_MarkedString_addThumbnails(x, ctx))
  )
  return new vscode.Hover(contents, hover.range)
}

async function vscode_MarkedString_addThumbnails(
  mdstr: vscode.MarkedString,
  ctx: vscode.ExtensionContext
) {
  // TODO: handle strings, and other types
  if (!(mdstr instanceof vscode.MarkdownString)) return mdstr
  let v = mdstr.value
  const storage = join(ctx.storageUri.fsPath, "thumbs")
  if (v.startsWith("thumbnail-for ")) {
    const url = v.split(" ")[1]
    const thumb = await puppeteer_get_thumb_memo(url, storage)
    const cacheBuster = Date.now()
    const imgUri = encodeURI(`file://${thumb}#${cacheBuster}`)
    const mm = new vscode.MarkdownString(`![](${imgUri})`)
    mm.isTrusted = true
    return mm
  }
  return mdstr
}

const puppeteer_get_thumb_memo = memoize(
  puppeteer_get_thumb,
  (x, y) => x + "" + y
)
