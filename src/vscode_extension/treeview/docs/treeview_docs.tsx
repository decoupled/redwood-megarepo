import { TreeItem, TreeItem_render } from "lambdragon"
import { memoize } from "lodash"
import React from "react"
import { redwoodjs_vsc_enabled } from "src/vscode_extension/redwoodjs_vsc_enabled"
import { vscode_ThemeIcon_memo as icon } from "src/x/vscode/vscode_ThemeIcon_memo"
import vscode from "vscode"

const treeview_docs_id = "redwoodjs.treeview.docs"

const treeview_docs_get = memoize((ctx: vscode.ExtensionContext) => {

  const ll = links.map(([label, icn, url]) => <TreeItem 
    label={label} 
    iconPath={icon(icn)} 
    collapsibleState={vscode.TreeItemCollapsibleState.None} 
    select={()=> {
      if (typeof url === 'string') vscode.env.openExternal(vscode.Uri.parse(url))
      if (typeof url === 'function') url()
    }}
    // resourceUri={vscode.Uri.parse(url)}
    />)

  return TreeItem_render(treeview_docs_id, <>
    {ll}
  </>)
})

const links = [
  ["Redwood Documentation", "question", 'https://redwoodjs.com'],
  ["Redwood Tutorials", "question", 'https://learn.redwoodjs.com/docs/tutorial/welcome-to-redwood/'],
  ["Chat on Discord", "comment-discussion", 'https://discord.gg/jjSYEQd'],
  ["Redwood on GitHub", "github", 'https://github.com/redwoodjs/redwood'],
  ["Open Issue on GitHub", "issues", 'https://github.com/redwoodjs/redwood/issues'],
  ["Redwood on Twitter", "twitter", 'https://twitter.com/redwoodjs'],
  ["Redwood Community (Discourse)", "comment", 'https://community.redwoodjs.com/'],
  ["Search Redwood Community...", "search", startSearch],
  ["Summon David Price's Spirit", "smiley", 'https://community.redwoodjs.com/'],
] as const

async function startSearch(){
  const res = await vscode.window.showInputBox({prompt: 'Search community.redwoodjs.com'})
  if (!res || res.length < 2) return
  const url = `https://community.redwoodjs.com/search?q=${encodeURIComponent(res)}`
  vscode.env.openExternal(vscode.Uri.parse(url))
}

export function treeview_docs_activate(ctx: vscode.ExtensionContext) {
  treeview_docs_get(ctx)
}

export function treeview_docs_contributes() {
  const c1 = treeview_docs_contributes_()
  return c1
  // return merge(c1, DevServerUI_contributes(), menus_contributes())
}

{
  treeview_docs_contributes()
}

function treeview_docs_contributes_() {
  return {
    contributes: {
      views: {
        redwood: [
          {
            id: treeview_docs_id,
            name: "Docs",
            when: redwoodjs_vsc_enabled,
          },
        ],
      },
    },
  }
}
