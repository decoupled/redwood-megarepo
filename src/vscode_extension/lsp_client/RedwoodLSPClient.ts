import {
  memo,
  URLString_fromFile,
  vscode_window_createTerminal_andRun,
} from "@decoupled/xlib"
import { xmethods } from "src/language_server/xmethods"
import vscode from "vscode"
import { LanguageClient, State } from "vscode-languageclient/node"
import { log } from "../log"
import { treeview_outline_setup } from "../treeview/outline/treeview_outline_setup"
import { LanguageClientOptions_build } from "./LanguageClientOptions_build"
import { ServerOptions_build } from "./ServerOptions_build"

export class RedwoodLSPClient {
  constructor(
    private pathToModule: string,
    private ctx: vscode.ExtensionContext
  ) {
    this.start()
  }
  status: "init" | "running" | "stopped" = "init"
  client!: LanguageClient
  private log(...args: any[]) {
    const msg = args.map(String).join(" ")
    log(msg)
    console.log(msg)
  }
  @memo()
  private async start() {
    this.log(`RedwoodLSPClient(${this.pathToModule}).start()`)
    // Create the language client and start the client.
    this.client = new LanguageClient(
      "redwood-language-server",
      "Redwood Language Server",
      ServerOptions_build(this.pathToModule),
      LanguageClientOptions_build(this.ctx)
    )

    this.client.onDidChangeState((e) => {
      const labels = {
        [State.Running]: "Running",
        [State.Starting]: "Starting",
        [State.Stopped]: "Stopped",
      }
      this.log(
        "Language Client state change:",
        labels[e.oldState],
        "-->",
        labels[e.newState]
      )
    })

    // This will also launch the server
    this.client.start()
    await this.client.onReady()
    this.log(`RedwoodLSPClient(${this.pathToModule}).client.onReady()`)
    this.status = "running"
    this.client.onRequest("xxx/showQuickPick", vscode.window.showQuickPick)
    this.client.onRequest(
      "xxx/showInformationMessage",
      vscode.window.showInformationMessage
    )
    // TODO: handle validate input
    this.client.onRequest("xxx/showInputBox", vscode.window.showInputBox)
    this.client.onRequest(
      "xxx/createTerminal2",
      async (props: { name: string; cwd: string; cmd: string }) => {
        vscode_window_createTerminal_andRun(props)
      }
    )
    this.setupOutline2()
  }

  async getInfo(uri: string): Promise<any[]> {
    await this.client.onReady()
    try {
      return await this.client.sendRequest(xmethods.getInfo, uri)
    } catch (e) {
      return []
    }
  }

  async getFilePathForRoutePath(
    routePath: string
  ): Promise<string | undefined> {
    await this.client.onReady()
    try {
      return await this.client.sendRequest(
        xmethods.getFilePathForRoutePath,
        routePath
      )
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
  async getRoutePathForFilePath(filePath: string): Promise<string | undefined> {
    await this.client.onReady()
    try {
      return await this.client.sendRequest(
        xmethods.getRoutePathForFilePath,
        URLString_fromFile(filePath)
      )
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  @memo()
  private setupOutline2() {
    const { client, ctx } = this
    treeview_outline_setup({ client, ctx })
  }

  async stop() {
    this.log(`RedwoodLSPClient(${this.pathToModule}).stop()`)
    if (this.status !== "running") {
      return false
    }
    await this.client.stop()
    this.status = "stopped"
  }
}
