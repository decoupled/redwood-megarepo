import { TreeItem } from "lambdragon"
import { observer } from "mobx-react"
import React from "react"
import vscode from "vscode"
import { ProjectModel } from "../../dev/model/ProjectModel"
import { FrameworkUI } from "./FrameworkUI"
import { WorkflowUI } from "./WorkflowUI"

@observer
export class RootUI extends React.Component<{ ctx: vscode.ExtensionContext }> {
  render() {
    const [wf] = vscode.workspace.workspaceFolders ?? []
    const dir = wf?.uri.fsPath
    if (!dir) return null
    const projectModel = ProjectModel.forDir(dir)
    if (!projectModel) return null
    return (
      <>
        <WorkflowUI projectModel={projectModel} ctx={this.props.ctx} />
        <TreeItem
          label="tools"
          collapsibleState={vscode.TreeItemCollapsibleState.Expanded}
        >
          <FrameworkUI
            framework={projectModel.framework}
            ctx={this.props.ctx}
          />
        </TreeItem>
      </>
    )
  }
}
