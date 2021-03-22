import { observer } from "mobx-react"
import React from "react"
import { TreeItem } from "lambdragon"
import { vscode_ThemeIcon_memo as icon } from "src/x/vscode/vscode_ThemeIcon_memo"
import vscode from "vscode"

export interface Props {
  type: "internal" | "external"
  onClickInternal(): void
  onClickExternal(): void
}

@observer
export class BrowserPickerUI extends React.Component<Props> {
  private get external() {
    return this.props.type === "external"
  }
  render() {
    const ok = icon("circle-filled")
    const nok = icon("circle-outline")
    return (
      <>
        <TreeItem
          key="vscode-browser"
          label="use vscode browser"
          iconPath={this.external ? nok : ok}
          collapsibleState={vscode.TreeItemCollapsibleState.None}
          select={() => this.props.onClickInternal()}
        />
        <TreeItem
          key="external-browser"
          label="use external browser"
          iconPath={this.external ? ok : nok}
          collapsibleState={vscode.TreeItemCollapsibleState.None}
          select={() => this.props.onClickExternal()}
        />
      </>
    )
  }
}
