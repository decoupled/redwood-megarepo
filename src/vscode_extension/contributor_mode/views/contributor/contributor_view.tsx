import {
  vscode_react_TreeItem as TreeItem,
  vscode_react_TreeItem_render as TreeItem_render,
  vscode_ThemeIcon_memo as icon,
} from "@decoupled/xlib"
import { VSCodeView } from "lambdragon"
import React from "react"
import { ids } from "src/vscode_extension/util/ids"
import vscode from "vscode"

export function contributor_view_activate(ctx: vscode.ExtensionContext) {
  const Root = () => (
    <TreeItem
      label="Contributor Mode"
      iconPath={icon("question")}
      collapsibleState={vscode.TreeItemCollapsibleState.None}
      // select={() => {
      //   if (typeof url === "string") {
      //     vscode.env.openExternal(vscode.Uri.parse(url))
      //   } else if (typeof url === "function") {
      //     url()
      //   }
      // }}
    />
  )
  return TreeItem_render(docs_view.id, <Root />)
}

const docs_view = new VSCodeView({
  id: ids.redwoodjs.views.contributor.$id,
  name: "Contributor",
  when: ids.redwoodjs.flags.contributor_mode_enabled.$id,
  _container: "redwood",
})
