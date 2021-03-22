import { TreeItem_render } from "lambdragon"
import { memoize } from "lodash"
import React from "react"
import { redwoodjs_vsc_enabled } from "src/vscode_extension/redwoodjs_vsc_enabled"
import vscode from "vscode"
import merge from "webpack-merge"
import { DevServerUIModel_mock, DevServerUI_contributes } from "./DevServerUI"
import { menus_contributes } from "./menus"
import { RootUI } from "./RootUI"

const treeview_workflow_id = "redwoodjs.treeview.workflow"

export const treeview_workflow_get = memoize((ctx: vscode.ExtensionContext) => {
  const dd = new DevServerUIModel_mock()
  return TreeItem_render(treeview_workflow_id, <RootUI ctx={ctx} />)
})

export function treeview_workflow_initialize(ctx: vscode.ExtensionContext) {
  treeview_workflow_get(ctx)
}

export function treeview_workflow_contributes() {
  const c1 = treeview_workflow_contributes_()
  return merge(c1, DevServerUI_contributes(), menus_contributes())
}

{
  treeview_workflow_contributes()
}

function treeview_workflow_contributes_() {
  return {
    contributes: {
      views: {
        redwood: [
          {
            id: treeview_workflow_id,
            name: "Workflow",
            when: redwoodjs_vsc_enabled,
          },
        ],
      },
    },
  }
}
