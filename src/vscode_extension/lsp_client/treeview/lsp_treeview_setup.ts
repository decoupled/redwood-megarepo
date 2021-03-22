import { cloneDeep } from "lodash"
import { vscode_ThemeIcon_memo } from "src/x/vscode/vscode_ThemeIcon_memo"
import vscode from "vscode"
import { LanguageClient } from "vscode-languageclient/node"
import { log } from "../../log"
import { contextValue, redwoodjs_treeview_id } from "./consts"
import { icon_uri } from "./icon_uri"
import { register_commands } from "./register_commands"

export function treeview_setup(opts: {
  ctx: vscode.ExtensionContext
  client: LanguageClient
}) {
  const { client, ctx } = opts
  register_commands((id, commandShortName) => {
    // client.sendRequest("redwoodjs/x-outline-callMethod", [id, method])
    const cmd = treeItemCache[id]?.menu?.[commandShortName]
    if (cmd) {
      const cmd2 = processCommand(cmd)
      vscode.commands.executeCommand(cmd2.command, ...(cmd2.arguments ?? []))
    }
  })
  const treeItemCache: any = {}
  vscode.window.createTreeView(redwoodjs_treeview_id, {
    treeDataProvider: {
      async getChildren(id: string | undefined): Promise<string[]> {
        try {
          const res = await client.sendRequest(
            "redwoodjs/x-outline-getChildren",
            id
          )
          return res as any
        } catch (e) {
          log("redwoodjs/x-outline-getChildren error: " + e)
          return []
        }
      },
      async getTreeItem(id) {
        const item: any = await client.sendRequest(
          "redwoodjs/x-outline-getTreeItem",
          id
        )
        // eslint-disable-next-line prefer-const
        let { iconPath, resourceUri, command, ...rest } = item
        if (typeof iconPath === "string") {
          if (iconPath.includes("://")) {
            iconPath = vscode.Uri.file(iconPath)
          } else {
            if (iconPath.startsWith("x-")) {
              iconPath = icon_uri(iconPath.split("-")[1], ctx)
            } else {
              iconPath = vscode_ThemeIcon_memo(iconPath)
            }
          }
        }
        if (typeof resourceUri === "string") {
          if (resourceUri.includes("://")) {
            resourceUri = vscode.Uri.file(resourceUri)
          }
        }
        if (command) {
          command = processCommand(command)
        }
        const item2 = { ...rest, iconPath, resourceUri, command }
        if (item2.menu) {
          item2.contextValue = contextValue(item2.menu.kind)
        }
        treeItemCache[id] = item2
        return item2
      },
      onDidChangeTreeData(listener) {
        client.onRequest("redwoodjs/x-outline-onDidChangeTreeData", (id) => {
          listener(id)
        })
        // and just in case, refresh everything every 5s
        setInterval(listener, 5000) //
        return null as any
      },
    },
    showCollapseAll: true,
  })
}

function processCommand(cmd: vscode.Command): vscode.Command {
  const { command, arguments: args, ...rest } = cloneDeep(cmd)
  if (args) {
    const a0 = args[0]
    if (typeof a0 === "string") {
      if (
        a0.startsWith("https://") ||
        a0.startsWith("http://") ||
        a0.startsWith("file://")
      ) {
        args[0] = vscode.Uri.parse(a0)
      }
    }
  }
  return { command, arguments: args, ...rest }
}
