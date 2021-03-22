import * as fs from "fs-extra"
import { cloneDeep } from "lodash"
import { xmethods } from "src/structure/language_server/xmethods"
import { memo } from "src/x/decorators"
import { URL_fromFile } from "src/x/url/URL_fromFile"
import { vscode_window_createTerminal_andRun } from "src/x/vscode/vscode_window_createTerminal_andRun"
import vscode from "vscode"
import {
  CloseAction,
  ErrorAction,
  ErrorHandler,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  State,
  TransportKind,
} from "vscode-languageclient/node"
import { log } from "../log"
import { lsp_client_middleware } from "./lsp_client_middleware"
import { treeview_setup } from "./treeview/lsp_treeview_setup"

/**
 * the lsp module can come and go as the user installs/uninstalls node_modules.
 * this class will watch for these changes and restart accordingly.
 * It manages the lifecycle of a RedwoodLSPClient
 */
export class RedwoodLSPClientManager {
  constructor(
    private pathToModule: string,
    private ctx: vscode.ExtensionContext
  ) {
    this.tick()
  }
  client: RedwoodLSPClient | undefined
  async tick() {
    const active = !this.stopped && fs.existsSync(this.pathToModule)
    if (active) {
      if (!this.client) {
        this.client = new RedwoodLSPClient(this.pathToModule, this.ctx)
      }
    } else {
      if (this.client) {
        this.client.stop()
        this.client = undefined
      }
    }
    if (!this.stopped) {
      setTimeout(() => this.tick(), 1000)
    }
  }
  private stopped = false
  stop() {
    this.stopped = true
  }
}

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
      buildServerOptions(this.pathToModule),
      buildClientOptions(this.ctx)
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
        URL_fromFile(filePath)
      )
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  @memo()
  private setupOutline2() {
    const { client, ctx } = this
    treeview_setup({ client, ctx })
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

/**
 *
 * @param module path to the lsp entry point on disk
 *   ex: "node_modules/@redwoodjs/structure/dist/language_server/start.js"
 */
function buildServerOptions(module: string): ServerOptions {
  // The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
  const debugOptions = {
    execArgv: [
      "--nolazy",
      "--inspect=6009",
      //"--inspect",
    ],
  }
  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  return {
    run: { module, transport: TransportKind.ipc },
    debug: {
      module,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  }
}

function buildClientOptions(ctx: vscode.ExtensionContext) {
  const tsLanguageIDs = [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "toml",
    "json",
  ]
  const tsLanguageselectors = tsLanguageIDs.map((language) => ({
    scheme: "file",
    language,
  }))
  const documentSelector = [
    ...tsLanguageselectors,
    { scheme: "file", language: "toml", pattern: "redwood.toml" },
    { scheme: "file", language: "prisma", pattern: "schema.prisma" },
  ]
  // Options to control the language client
  const _errorHandler: ErrorHandler = {
    error(error, message, count) {
      console.log("lsp client connection error", error, message, count)
      return ErrorAction.Shutdown
    },
    closed() {
      return CloseAction.Restart
    },
  }
  return {
    documentSelector,
    diagnosticCollectionName: "Redwood",
    middleware: lsp_client_middleware(ctx),
    // errorHandler,
    // middleware: {
    //   async provideCodeLenses(document, token, next) {
    //     try {
    //       return await next(document, token)
    //     } catch (e) {
    //       console.log("caught error: " + e)
    //     }
    //   },
    // },
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher(
        "**/.{ts,tsx,js,jsx,toml,json,prisma}"
      ),
    },
  } as LanguageClientOptions
}

function _processCommand(cmd: vscode.Command): vscode.Command {
  const { command, arguments: args, ...rest } = cloneDeep(cmd)
  if (args) {
    const a0 = args[0]
    if (typeof a0 === "string") {
      if (
        a0.startsWith("https://") ||
        a0.startsWith("http://") ||
        a0.startsWith("file://")
      ) {
        args[0] = vscode.Uri.parse(a0)
      }
    }
  }
  return { command, arguments: args, ...rest }
}
