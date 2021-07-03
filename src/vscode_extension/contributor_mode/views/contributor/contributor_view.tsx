import {
  fs_findAvailableDirAppendNumber,
  vscode_react_TreeItem as TreeItem,
  vscode_react_TreeItem_render as TreeItem_render,
  vscode_run,
  vscode_ThemeIcon_memo as icon,
} from "@decoupled/xlib"
import execa from "execa"
import * as fs from "fs-extra"
import { VSCodeView } from "lambdragon"
import { computed, makeObservable } from "mobx"
import { observer } from "mobx-react"
import { now } from "mobx-utils"
import * as os from "os"
import { join, basename } from "path"
import React from "react"
import { ids } from "src/vscode_extension/util/ids"
import vscode from "vscode"
import { contributor_mode_find_dir } from "../../contributor_mode_detect"

export function contributor_view_activate(ctx: vscode.ExtensionContext) {
  const Root = () => (
    <>
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
      <LocalTestProjects />
    </>
  )
  return TreeItem_render(docs_view.id, <Root />)
}

function localProjectsDir() {
  return join(os.homedir(), "redwoodjs-contributor/local-test-projects")
}

function* listLocalProjects() {
  const dir = localProjectsDir()
  if (!fs.existsSync(dir)) return
  for (const d of fs.readdirSync(dir)) {
    const dd = join(dir, d)
    if (fs.existsSync(dd)) yield dd
  }
}

@observer
class LocalTestProjects extends React.Component {
  constructor(props) {
    super(props)
    makeObservable(this)
  }
  @computed.struct get list() {
    now(500)
    return Array.from(listLocalProjects())
  }
  render() {
    return (
      <TreeItem
        label="Local Test Projects"
        iconPath={icon("folder")}
        collapsibleState={vscode.TreeItemCollapsibleState.Expanded}
      >
        {this.list.map((dir) => (
          <LocalTestProject dir={dir} key={dir} />
        ))}
        <TreeItem
          key="___create___"
          label="Create Local Test Project"
          iconPath={icon("new-folder")}
          collapsibleState={vscode.TreeItemCollapsibleState.None}
          description="Create a test project"
          select={() => {
            create_test_project()
          }}
        ></TreeItem>
      </TreeItem>
    )
  }
}

@observer
class LocalTestProject extends React.Component<{ dir: string }> {
  constructor(props) {
    super(props)
    // makeObservable(this)
  }
  render() {
    const { dir } = this.props
    return (
      <TreeItem
        // resourceUri={vscode.Uri.file(dir)}
        label={basename(dir)}
        iconPath={icon("folder")}
        collapsibleState={vscode.TreeItemCollapsibleState.Expanded}
      >
        <TreeItem
          label="Open in VSCode"
          iconPath={icon("edit")}
          description="(new window)"
          collapsibleState={vscode.TreeItemCollapsibleState.None}
          select={() => {
            execa("code", [dir])
          }}
        />
        <TreeItem
          label="run rwt link"
          description="to connect this version of the framework"
          iconPath={icon("link")}
          collapsibleState={vscode.TreeItemCollapsibleState.None}
        />
        <TreeItem
          label="Run e2e (cypress) tests"
          iconPath={icon("beaker")}
          collapsibleState={vscode.TreeItemCollapsibleState.None}
        />
        <TreeItem
          label="update framework to latest canary"
          iconPath={icon("cloud-download")}
          collapsibleState={vscode.TreeItemCollapsibleState.None}
        />
        <TreeItem
          label="create a copy"
          iconPath={icon("copy")}
          collapsibleState={vscode.TreeItemCollapsibleState.None}
        />
      </TreeItem>
    )
  }
}

// ./tasks/run-e2e

async function create_test_project() {
  const cwd = contributor_mode_find_dir()
  if (!cwd) return
  // const targetDir = "/tmp/redwood-functional-test-project-3"
  const targetDir = fs_findAvailableDirAppendNumber(
    join(localProjectsDir(), "redwood-test-project"),
    "-"
  )
  await vscode.window.withProgress(
    {
      title:
        "Creating and Initializing a fresh Redwood project for testing. This will take a while",
      location: vscode.ProgressLocation.Notification,
    },
    async () => {
      const cmd = `yarn run build:test-project '${targetDir}'`

      await vscode_run({ cmd, cwd, name: "Redwood Test Project Setup" })
    }
  )
  await vscode.window.withProgress(
    {
      title: "Linking both projects",
      location: vscode.ProgressLocation.Notification,
    },
    async () => {
      const cmd = `yarn rwt link ${cwd}`
      await vscode_run({ cmd, cwd: targetDir, name: "Redwood Tools Link" })
    }
  )
  await vscode.window.showInformationMessage(
    "Ready! I will now open a new VSCode window pointing to the target project so you can edit side by side",
    "Ok"
  )
  vscode_run({ cmd: `code '${targetDir}'`, cwd })
}

const docs_view = new VSCodeView({
  id: ids.redwoodjs.views.contributor.$id,
  name: "Contributor",
  when: ids.redwoodjs.flags.contributor_mode_enabled.$id,
  _container: "redwood",
})
