import {
  vscode_react_TreeItem as TreeItem,
  vscode_react_TreeItem_render as TreeItem_render,
  vscode_ThemeIcon_memo as icon,
} from "@decoupled/xlib"
import { VSCodeView } from "lambdragon"
import { memoize } from "lodash"
import React from "react"
import { redwoodjs_vsc_enabled } from "src/vscode_extension/redwoodjs_vsc_enabled"
import vscode from "vscode"

export function treeview_docs_activate(ctx: vscode.ExtensionContext) {
  treeview_docs_get(ctx)
}

const docs_view = new VSCodeView({
  id: "redwoodjs.views.docs",
  name: "Docs",
  when: redwoodjs_vsc_enabled,
  _container: "redwood",
})

const treeview_docs_get = memoize((ctx: vscode.ExtensionContext) => {
  const ll = links.map(([label, icn, url]) => (
    <TreeItem
      label={label}
      iconPath={icon(icn)}
      collapsibleState={vscode.TreeItemCollapsibleState.None}
      select={() => {
        if (typeof url === "string") {
          vscode.env.openExternal(vscode.Uri.parse(url))
        } else if (typeof url === "function") {
          url()
        }
      }}
    />
  ))

  return TreeItem_render(docs_view.id, <>{ll}</>)
})

const links = [
  ["Redwood Documentation", "question", "https://redwoodjs.com"],
  [
    "Redwood Tutorials",
    "question",
    "https://learn.redwoodjs.com/docs/tutorial/welcome-to-redwood/",
  ],
  ["Chat on Discord", "comment-discussion", "https://discord.gg/jjSYEQd"],
  ["Redwood on GitHub", "github", "https://github.com/redwoodjs/redwood"],
  [
    "Open Issue on GitHub",
    "issues",
    "https://github.com/redwoodjs/redwood/issues",
  ],
  ["Redwood on Twitter", "twitter", "https://twitter.com/redwoodjs"],
  [
    "Redwood Community (Discourse)",
    "comment",
    "https://community.redwoodjs.com/",
  ],
  ["Search Redwood Community...", "search", startSearch],
  ["Summon David Price's Spirit", "smiley", "https://community.redwoodjs.com/"],
] as const

async function startSearch() {
  const res = await vscode.window.showInputBox({
    prompt: "Search community.redwoodjs.com",
  })
  if (!res || res.length < 2) return
  const url = `https://community.redwoodjs.com/search?q=${encodeURIComponent(
    res
  )}`
  vscode.env.openExternal(vscode.Uri.parse(url))
}
