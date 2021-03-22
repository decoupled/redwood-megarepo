import { lazy } from "src/x/decorators"
import { computed, observable, reaction } from "mobx"
import { now } from "mobx-utils"
import vscode from "vscode"

import { framework_version__installed } from "../util/framework_version__installed"
import { framework_version__latest } from "../util/framework_version__latest"

interface Opts {
  ctx: vscode.ExtensionContext
  projectRoot: string
}

export function statusbar(opts: Opts) {
  // eslint-disable-next-line no-new
  new RedwoodjsStatusBarManager(opts)
}

class RedwoodjsStatusBarManager {
  constructor(private opts: Opts) {
    const d1 = vscode.commands.registerCommand(
      "_redwoodjs.show_new_version_message",
      async () => {
        if (!this.installedFrameworkVersion) {
          return
        }
        const m = this.newerVersionIsAvailable
          ? "A newer version of Redwood is available"
          : "You are using the latest Redwood version"
        vscode.window.showInformationMessage(m)
      }
    )

    this.sub(d1)

    const d2 = reaction(
      () => this.statusBarItemText,
      (x) => {
        this.statusBarItem.text = x
      },
      { fireImmediately: true }
    )

    this.sub({ dispose: d2 })

    this.fetchLatestVersion()
  }

  private sub(d: vscode.Disposable) {
    this.opts.ctx.subscriptions.push(d)
  }

  @computed
  get installedFrameworkVersion() {
    const v = framework_version__installed(this.opts.projectRoot)
    now(v ? 3000 : 1000)
    return v
  }

  @observable latestVersion: string | undefined
  private async fetchLatestVersion() {
    this.latestVersion = await framework_version__latest()
  }

  @computed get newerVersionIsAvailable() {
    if (!this.latestVersion) {
      return false
    }
    if (!this.installedFrameworkVersion) {
      return false
    }
    return this.latestVersion !== this.installedFrameworkVersion
  }

  @computed
  get statusBarItemText() {
    const v = this.installedFrameworkVersion
    if (!v) {
      return "Redwood"
    }
    const icon = `$(info)`
    if (this.newerVersionIsAvailable) {
      return `Redwood ${v} ${icon}`
    }
    return `Redwood ${v}`
  }

  @lazy() get statusBarItem() {
    const si = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    )
    si.text = this.statusBarItemText
    si.command = "_redwoodjs.show_new_version_message"
    si.show()
    this.sub(si)
    return si
  }
}
