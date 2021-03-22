import { observable } from "mobx"
import fetch from "node-fetch"
// "http://localhost:8910"
export class HttpHealthCheck {
  constructor(public readonly url: string, public interval: number = 2000) {
    this.iter()
  }
  @observable
  status: "init" | "ok" | "nok" = "init"
  private lastCheckTime: number | undefined
  private timer: any
  private async iter() {
    if (this.timer) clearTimeout(this.timer)
    let isOk = false
    try {
      // console.log("fetch")
      const status = (await fetch(this.url)).status
      // console.log("status = ", status)
      isOk = status === 200
    } catch (e) {}
    this.lastCheckTime = Date.now()
    this.timer = setTimeout(() => {
      this.iter()
    }, this.interval)
    if (isOk) {
      this.status = "ok"
      return true
    } else {
      this.status = "nok"
      return false
    }
  }
  destroy() {
    if (this.timer) clearTimeout(this.timer)
  }
}
