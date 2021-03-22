import { observable } from "mobx"
import { observer } from "mobx-react"
import React from "react"
import { TreeItem } from "lambdragon"
import { vscode_ThemeIcon_memo as icon } from "src/x/vscode/vscode_ThemeIcon_memo"
import vscode from "vscode"
@observer
export class DebuggingUI extends React.Component {
  @observable external = true
  render() {
    return (
      <TreeItem
        key="debugging"
        label="start debugging"
        iconPath={icon("debug-alt")}
        collapsibleState={vscode.TreeItemCollapsibleState.None}
      />
    )
  }
}
