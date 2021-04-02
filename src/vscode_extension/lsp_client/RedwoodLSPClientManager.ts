import * as fs from "fs-extra"
import vscode from "vscode"
import { RedwoodLSPClient } from "./RedwoodLSPClient"

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
