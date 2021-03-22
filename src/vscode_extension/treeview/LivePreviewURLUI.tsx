import { TreeItem } from "lambdragon"
import { observable } from "mobx"
import { observer } from "mobx-react"
import React from "react"
import { vscode_ThemeIcon_memo as icon } from "src/x/vscode/vscode_ThemeIcon_memo"
import vscode from "vscode"

@observer
export class LivePreviewURLUI extends React.Component {
  @observable enabled = false
  render() {
    return (
      <TreeItem
        key="live preview"
        label="enable live preview url"
        description=""
        iconPath={this.enabled ? icon("check") : icon("chrome-maximize")}
        collapsibleState={
          this.enabled
            ? vscode.TreeItemCollapsibleState.Expanded
            : vscode.TreeItemCollapsibleState.None
        }
        select={() => {
          this.enabled = !this.enabled
        }}
      >
        {!this.enabled && (
          <TreeItem
            key="loading"
            description="loading..."
            collapsibleState={vscode.TreeItemCollapsibleState.None}
          ></TreeItem>
        )}
        {this.enabled && (
          <TreeItem
            key="clippy"
            iconPath={icon("clippy")}
            label="copy url to clipboard"
            collapsibleState={vscode.TreeItemCollapsibleState.None}
          ></TreeItem>
        )}
        {this.enabled && (
          <TreeItem
            key="browser"
            iconPath={icon("link-external")}
            label="open in browser"
            collapsibleState={vscode.TreeItemCollapsibleState.None}
          ></TreeItem>
        )}
      </TreeItem>
    )
  }
}
