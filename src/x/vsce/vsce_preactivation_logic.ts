export function vsce_preactivation_logic(importer: Importer) {
  return new Preactivator(importer)
}

type Importer = (ctx: vscode.ExtensionContext) => Promise<Extension>

interface Extension {
  activate(ctx: vscode.ExtensionContext): any
  deactivate?(): void
}

class Preactivator {
  private _ctx: vscode.ExtensionContext | undefined
  constructor(private importer: Importer) {}

  get hasNodeModulesFolder() {
    return fs.existsSync(this.ctx.extensionPath + "/node_modules")
  }

  @lazy() get extensionName() {
    return basename(this.ctx.extensionPath)
  }

  @lazy() get vscode() {
    return vscode_()
  }

  @lazy() get outputChannel() {
    return this.vscode.window.createOutputChannel(
      `${this.extensionName} (preactivator)`
    )
  }

  get ctx() {
    if (!this._ctx) {
      throw new Error("ctx not defined")
    } else {
      return this._ctx
    }
  }

  async activate(ctx: vscode.ExtensionContext) {
    this._ctx = ctx
    this.log("process.pid=" + process.pid)
    this.log("extensionPath=" + this.ctx.extensionPath)
    this.log("extensionMode=" + this.ctx.extensionMode)
    this.log("preactivate...")
    if (!this.hasNodeModulesFolder) {
      this.log("node_modules not found")
      await this.vscode.window.withProgress(
        {
          location: this.vscode.ProgressLocation.Window,
          title: `installing dependencies (${this.extensionName})`,
        },
        async () => {
          await this.installModules()
        }
      )
    } else {
      this.log("node_modules present. no need to install")
    }
    this.log("ready to activate real extension")
    return (await this.realExtension()).activate(this.ctx)
  }

  @memo() async realExtension() {
    try {
      return await this.import()
    } catch (e) {
      this.log(e)
      throw e
    }
  }

  @memo() import() {
    return this.importer(this.ctx)
  }

  @memo() async deactivate() {
    const x = await this.realExtension()
    x.deactivate?.()
  }

  private log(...args: any[]) {
    console.log(...args)
    this.outputChannel.appendLine(args.join(" "))
  }

  @memo()
  private async installModules() {
    let y_n = yarn_or_npm()
    if (typeof y_n !== "string") {
      //throw new Error("Could not find yarn or NPM")
      y_n = "npm"
    }
    // TODO: yarn install --frozen-lockfile
    this.log("installing modules with " + y_n)
    const cmd_args: string[] = [y_n]
    if (y_n === "npm") {
      cmd_args.push("install")
    }
    const [cmd, ...args] = cmd_args
    this.log(cmd_args)
    const { stdout, stderr } = await execa(cmd, args, {
      cwd: this.ctx.extensionPath,
    })
    this.log(stdout)
    this.log(stderr)
    // const out = await spawnCancellable(cmd, args, {
    //   cwd: this.ctx.extensionPath,
    //   //env: { PUPPETEER_SKIP_DOWNLOAD: "true" },
    //   stderr_cb: d => this.log(d),
    //   stdout_cb: d => this.log(d),
    // })
    // this.log(out)
  }

  // @lazy() private get realExtension() {
  //   let r = require // bypass smart-ass bundlers :)
  //   const ppp = join(this.ctx.extensionPath, "out-extension", "index.js")
  //   return r(ppp)
  // }
}

import * as fs from "fs"
import { basename } from "path"

import execa from "execa"
import { lazy } from "src/x/decorators"
import { memo } from "src/x/decorators"
import * as vscode from "vscode"

import { vscode_ } from "../vscode/vscode_"
import { yarn_or_npm } from "../yarn/yarn_or_npm"
