import { computed, observable } from "mobx"
import { observer } from "mobx-react"
import React from "react"
import { TreeItem } from "lambdragon"
import { vscode_ThemeIcon_memo as icon } from "src/x/vscode/vscode_ThemeIcon_memo"
import vscode from "vscode"

@observer
export class CheckboxUI extends React.Component<{ label: string }> {
  @observable checked = false
  @computed get icon() {
    return this.checked ? icon("check") : icon("chrome-maximize")
  }
  render() {
    return (
      <TreeItem
        key="checkbox"
        label={this.props.label}
        iconPath={this.icon}
        collapsibleState={vscode.TreeItemCollapsibleState.None}
        select={() => {
          this.checked = !this.checked
        }}
      />
    )
  }
}
