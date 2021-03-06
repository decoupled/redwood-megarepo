import { lazy } from "@decoupled/xlib"
import { existsSync } from "fs-extra"
import { dirname, join } from "path"
import { language_server } from "src/language_server/language_server"
import * as vscode from "vscode"
import { commands_activate } from "./commands/commands_activate"
import { contributor_mode_activate } from "./contributor_mode/contributor_mode"
import { decorations_activate } from "./decorations/decorations"
import { USE_NEW_LANGUAGE_SERVER } from "./flags"
import { log } from "./log"
import { lsp_path_for_project } from "./lsp_client/lsp_path_for_project"
import { RedwoodLSPClientManager } from "./lsp_client/RedwoodLSPClientManager"
import { new_version_message } from "./statusbar/new_version_message"
import { statusbar_activate } from "./statusbar/statusbar"
import { telemetry_activate } from "./telemetry/telemetry"
import { treeview_docs_activate } from "./treeview/docs/treeview_docs"
import { framework_version__installed } from "./util/framework_version__installed"
import { ids } from "./util/ids"
import { simple_watcher } from "./util/simple_watcher"

export async function redwoodjs_vsc(ctx: vscode.ExtensionContext) {
  // new version check. we can get rid of this once the old version
  // is removed from the store
  if (await new_version_message(ctx)) {
    // stop all initialization
    return
  }
  telemetry_activate(ctx)
  // const manager = new RedwoodVSCProjectManager(ctx)
  // ctx.subscriptions.push(manager)

  ctx.subscriptions.push(
    simple_watcher(getTopLevelRWTomlPath, (rwpath) => {
      const projectRoot = dirname(rwpath)
      const project = new RedwoodVSCProject({ ctx, projectRoot })
      redwoodjs_vsc_enabled_set(true)
      return {
        dispose() {
          project.dispose()
          redwoodjs_vsc_enabled_set(false)
        },
      }
    })
  )

  commands_activate(ctx)
  treeview_docs_activate(ctx)
  contributor_mode_activate(ctx)
}

function redwoodjs_vsc_enabled_set(v: boolean) {
  vscode.commands.executeCommand(
    "setContext",
    ids.redwoodjs.flags.redwoodjs_project_detected.$id,
    v
  )
}

interface Opts {
  projectRoot: string
  lspServerPath?: string
  ctx: vscode.ExtensionContext
}

class RedwoodVSCProject {
  private disposables: vscode.Disposable[] = []
  constructor(public opts: Opts) {
    console.log("new RedwoodVSCProject(" + opts.projectRoot + ")")

    log("new RedwoodVSCProject(" + opts.projectRoot + ")")

    statusbar_activate(opts)

    telemetry_activate(this.opts.ctx).event_redwoodProjectDetected({
      redwoodVersion: this.redwoodVersion ?? "",
    })

    decorations_activate(this.opts.ctx, async (uri) => {
      const info = (await this.lspClient.client?.getInfo(uri.toString())) ?? []
      return info.filter((i) => i.kind === "Decoration")
    })

    // eslint-disable-next-line no-unused-expressions
    this.lspClient // make sure client is initialized
  }

  @lazy()
  get redwoodVersion() {
    return framework_version__installed(this.projectRoot)
  }

  @lazy()
  get projectRoot() {
    return this.opts.projectRoot
  }

  @lazy()
  get lspServerPath() {
    if (USE_NEW_LANGUAGE_SERVER) {
      return language_server.getPathInVSCodeExtensionFolder(this.ctx)
    }
    const p = lsp_path_for_project(this.projectRoot)
    if (!p) {
      log(`could not find redwood language server`)
      throw new Error("lsp not found")
    }
    log(`redwood language server path = ${p}`)
    return p
  }

  @lazy() get lspClient(): RedwoodLSPClientManager {
    return new RedwoodLSPClientManager(this.lspServerPath, this.opts.ctx)
  }

  get ctx() {
    return this.opts.ctx
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose())
  }
}

function getTopLevelRWTomlPath(): string | undefined {
  const wfs = vscode.workspace.workspaceFolders
  if (!wfs) {
    return
  }
  if (wfs.length !== 1) {
    return
  }
  const w = wfs[0]
  if (!w.uri.toString().startsWith("file://")) {
    return
  } // only local files
  const rwPath = join(w.uri.fsPath, "redwood.toml")
  if (existsSync(rwPath)) {
    return rwPath
  }
}
