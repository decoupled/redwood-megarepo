import { TreeItem, TreeItem_Menu_create } from "lambdragon"
import { observable } from "mobx"
import { observer } from "mobx-react"
import React from "react"
import { vscode_ThemeIcon_memo as icon } from "src/x/vscode/vscode_ThemeIcon_memo"
import vscode from "vscode"
import { ProjectModel } from "../../dev/model/ProjectModel"
import { menu_def_workflow } from "./menus"
import { StepDevelopUI } from "./StepDevelopUI"
import { buildLabelProps } from "../util/buildLabelProps"

@observer
export class WorkflowUI extends React.Component<{
  projectModel: ProjectModel
  ctx: vscode.ExtensionContext
}> {
  @observable step = 0

  componentDidMount() {
    setInterval(() => {
      //console.log("this.step = ", this.step)
      if (this.step < 2) this.step++
    }, 5000)
  }
  private stateForStep(num: number) {
    return undefined
    if (num === this.step) return "running"
    if (num > this.step) return "disabled"
    return undefined
  }
  private render_1_fetch() {
    const label = "1.fetch code"
    const state = this.stateForStep(1)
    const description = undefined
    const iconPath = icon("cloud-download")
    const props = buildLabelProps({ label, state, description, iconPath })
    return (
      <TreeItem
        {...props}
        collapsibleState={vscode.TreeItemCollapsibleState.None}
      />
    )
  }

  private render_2_develop_locally() {
    return (
      <StepDevelopUI
        projectModel={this.props.projectModel}
        ctx={this.props.ctx}
      />
    )
  }

  private render_3_build_locally() {
    const iconPath = icon("vm")
    const label = "3. build locally"
    const state = undefined
    const description = ""
    const props = buildLabelProps({ label, state, description })
    const collapsibleState =
      state === "disabled"
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Collapsed
    const bs = this.props.projectModel.buildServerModel

    const props2 = {
      iconPath: icon("gear"),
      state: bs.isRunning ? "running" : undefined,
      label: "rw build",
      description: "",
    } as const
    const props22 = buildLabelProps(props2)

    return (
      <TreeItem
        {...props}
        iconPath={iconPath}
        collapsibleState={collapsibleState}
      >
        <TreeItem
          select={() => bs.start()}
          {...props22}
          collapsibleState={vscode.TreeItemCollapsibleState.None}
        />
        <TreeItem
          iconPath={icon("server-process")}
          select={() => bs.serve()}
          label="rw serve"
          collapsibleState={vscode.TreeItemCollapsibleState.None}
        />
        <TreeItem
          iconPath={icon("browser")}
          label="browser"
          collapsibleState={vscode.TreeItemCollapsibleState.None}
        />
      </TreeItem>
    )
  }

  private render_4_deploy() {
    const iconPath = icon("cloud-upload")
    const label = "4. push, preview and deploy"
    const state = undefined
    const description = "on netlify"
    const props = buildLabelProps({ label, state, description })
    const collapsibleState =
      state === "disabled"
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Collapsed
    return (
      <TreeItem
        {...props}
        iconPath={iconPath}
        collapsibleState={collapsibleState}
      ></TreeItem>
    )
  }

  private menu_workflow = TreeItem_Menu_create(menu_def_workflow, {
    open_diagram: () => {
      console.log("open diagram!!")
    },
  })

  render() {
    return (
      <TreeItem
        label={"workflow"}
        iconPath={icon("checklist")}
        collapsibleState={vscode.TreeItemCollapsibleState.Expanded}
        menu={this.menu_workflow}
      >
        {this.render_1_fetch()}
        {this.render_2_develop_locally()}
        {this.render_3_build_locally()}
        {this.render_4_deploy()}
      </TreeItem>
    )
  }
}
