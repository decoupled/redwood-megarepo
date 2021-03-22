import fkill from "fkill"
import { existsSync, outputFileSync } from "fs-extra"
import { Memoize as memo } from "lodash-decorators"
import { computed, observable, when } from "mobx"
import net from "net"
import { join } from "path"
import pe from "process-exists"
import { AddressInfo_cast_getPort_orThrow } from "src/x/net/AddressInfo"
import tmp from "tmp"
import { shell_wrapper_source } from "./shell_wrapper_source"

export class WrappedCommand {
  constructor(public cmd: string) {
    this.init()
  }
  private async init() {
    // await when(() => this.state === "stopped")
  }
  @memo() run<T>(actualRun: (cmd: string) => Promise<T>): Promise<T> {
    this.state = "starting"
    const server = this.server()
    const port = AddressInfo_cast_getPort_orThrow(server.address())
    const cmd2 = ["node", generate_wrapper_js(), port, this.cmd].join(" ")
    return actualRun(cmd2)
  }
  @observable state: "init" | "starting" | "running" | "stopping" | "stopped" =
    "init"
  @computed get isRunning(): boolean {
    if (typeof this.pid === "undefined") return false
    if (typeof this.exitCode === "number") return false
    return true
  }
  @observable private pid: number | undefined
  @observable private pidwrapper: number | undefined
  private pid_set(x: number) {
    this.pid = x
    this.state = "running"
    this.pid_ckeck_if_exists()
  }
  private pidwrapper_set(x: number) {
    this.pidwrapper = x
  }
  private async pid_ckeck_if_exists() {
    if (typeof this.pid !== "number") return
    const exists = await pe(this.pid)
    if (!exists) {
      this.pid = undefined
      this.state = "stopped"
    } else {
      setTimeout(() => {
        this.pid_ckeck_if_exists()
      }, 1000)
    }
  }
  @observable exitCode: number | undefined
  @memo() async waitForExitCode(): Promise<number> {
    await when(() => typeof this.exitCode === "number")
    return this.exitCode as any
  }
  private _socket: net.Socket | undefined
  @memo() server() {
    return net
      .createServer((socket) => {
        this._socket = socket
        socket.on("data", (data) => {
          const str = data.toString()
          const pid = extract(pid_re, str)
          const pidwrapper = extract(pidwrapper_re, str)
          const exit = extract(exit_re, str)
          if (typeof pid === "string") {
            this.pid_set(parseInt(pid))
          }
          if (typeof pidwrapper === "string") {
            this.pidwrapper_set(parseInt(pidwrapper))
          }
          if (typeof exit === "string") {
            this.exitCode = parseInt(exit)
            this.state = "stopped"
            this.server().close()
          }
        })
      })
      .listen()
  }
  @memo() async kill() {
    await when(() => this.state === "running")
    await this._kill()
  }
  @memo() private async _kill() {
    this.state = "stopping"
    //this._socket?.write("___KILL___")
    const { pid, pidwrapper } = this
    if (pid) {
      try {
        await fkill(pid, { tree: true })
      } catch (e) {}
      this.pid = undefined
    }
    if (pidwrapper) {
      try {
        await fkill(pidwrapper, { tree: true })
      } catch (e) {}
      this.pidwrapper = undefined
    }
    try {
      this._socket?.end()
    } catch (e) {}
    this.state = "stopped"
  }
}

/**
 * The VSCode terminal doesn't let us capture IO or the exit code.
 * This is why we created this wrapper.
 * @param cmd
 * @param actualRun
 */
export async function shell_wrapper_run_or_fail(
  cmd: string,
  actualRun: (cmd: string) => any
): Promise<void> {
  const ww = new WrappedCommand(cmd)
  ww.run(actualRun)
  const code = await ww.waitForExitCode()
  if (code !== 0) throw new Error()
}

function generate_wrapper_js() {
  const workDir = tmp.dirSync().name
  const wrapperPath = join(workDir, "shell_wrapper.js")
  if (!existsSync(wrapperPath))
    outputFileSync(wrapperPath, shell_wrapper_source)
  return wrapperPath
}

const pidwrapper_re = /____PIDWRAPPER____\(([^)]+)/g
const pid_re = /____PID____\(([^)]+)/g
const exit_re = /____EXIT____\(([^)]+)/g

function extract(re: RegExp, str: string) {
  return re.exec(str)?.[1]
}
