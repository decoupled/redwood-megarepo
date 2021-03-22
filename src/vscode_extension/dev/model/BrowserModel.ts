import { computed, observable, reaction, when } from "mobx"
import { URLWatcher } from "src/x/http/URLWatcher"
import { ProjectModel } from "./ProjectModel"
import opn from "open"
import { browser_preview } from "../browser_preview"
export class BrowserModel {
  constructor(private project: ProjectModel) {
    reaction(
      () => this.urlToWatch,
      async (url) => {
        if (typeof url === "undefined") {
          this.portWatcher?.stop()
          this.portWatcher = undefined
        } else {
          this.portWatcher = new URLWatcher({
            url,
          })
        }
      },
      { fireImmediately: true }
    )
  }

  @observable portWatcher: URLWatcher | undefined

  @computed get urlToWatch() {
    const s = this.project.devServerModel.status
    if (s === "stopped") return undefined
    return this.project.openURL
  }

  get enabled() {
    return this.portWatcher?.isOK === true
  }
  @observable selected_browser_type: "internal" | "external" = "external"
  async click_browser_item() {
    this.open()
  }
  async click_browser_external_item() {
    this.selected_browser_type = "external"
    this.open()
  }
  async click_browser_internal_item() {
    this.selected_browser_type = "internal"
    this.open()
  }

  private async open() {
    const url = this.project.openURL
    if (!url) return
    await when(() => this.enabled)
    if (this.selected_browser_type === "internal") {
      browser_preview(url)
    } else {
      opn(url)
    }
  }
}
