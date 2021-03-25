import { computed, observable } from "mobx"
import { now } from "mobx-utils"
import vscode from "vscode"
import { wait } from "src/x/Promise/wait"
import { WrappedCommand } from "src/x/vscode/Terminal/shell_wrapper/shell_wrapper_run"
import { vscode_window_createTerminal_andRun } from "src/x/vscode/vscode_window_createTerminal_andRun"
import { DevServerStatus, DevServerUIModel } from "../ui/DevServerUI"
import { ProjectModel } from "./ProjectModel"
import { URLWatcher } from "src/x/http/URLWatcher"

export class DevServerModel implements DevServerUIModel {
  constructor(private project: ProjectModel) {}
  @computed get status(): DevServerStatus {
    now(300)
    if (this.project.browserReady) return 'started'
    if (!this.devCommandIsRunning) return "stopped"
    if (!this.project.browserReady) return "starting"
    return "started"
  }
  get devCommandIsRunning() {
    now(300)
    return this.cmdWrapper?.isRunning === true
  }
  @observable
  private cmdWrapper: WrappedCommand | undefined
  @observable
  private terminal: vscode.Terminal | undefined
  async start() {
    if (this.cmdWrapper) return
    this.cmdWrapper = new WrappedCommand(this.devCommand)
    this.terminal = await this.cmdWrapper.run(async (cmd) =>
      vscode_window_createTerminal_andRun({
        cmd,
        cwd: this.project.dir,
        name: "Dev",
      })
    )

    await new URLWatcher({
      url: `http://localhost:${this.project.web_port}/`,
    }).waitForNextOK()

    this.project.browserReady = true
  }
  async restart() {
    await this.stop()
    await wait(500)
    await this.start()
  }
  async stop() {
    if (!this.cmdWrapper) return
    this.cmdWrapper.kill()
    this.cmdWrapper = undefined
    await wait(500)
    // if we call terminal.dispose() we might be interrupting the kill()
    // so we will end up with a set of zombie development servers
    //this.terminal?.dispose()
    //this.terminal = undefined
  }

  view_logs() {
    this.terminal?.show()
  }

  @computed get label() {
    if (this.project.browserReady) return "dev server (running)"
    if (this.devServerRunning) return "dev server starting..."
    return "start dev server"
  }

  @computed get description() {
    return this.project.framework
  }

  private get devCommand() {
    if (this.project.framework === "redwood") return "yarn && yarn rw dev"
    return "yarn start"
  }

  @computed private get devServerRunning() {
    return this.cmdWrapper?.isRunning === true
  }
}
