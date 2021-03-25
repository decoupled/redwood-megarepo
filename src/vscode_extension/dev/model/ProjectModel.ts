import { memoize } from "lodash"
import { observable, when } from "mobx"
import { getConfig } from "src/internal"
import { lazy, memo } from "src/x/decorators"
import { BrowserModel } from "./BrowserModel"
import { BuildServerModel } from "./BuildServerModel"
import { DevServerModel } from "./DevServerModel"

export class ProjectModel {
  private constructor(public readonly dir: string) {}

  @memo() getConfig(){
    return getConfig(this.dir + 'redwood.toml')
  }

  @lazy() get web_port(){
    return this.getConfig().web.port
  }

  get framework() {
    return "redwood"
  }
  
  get openURL() {
    return `http://localhost:${this.web_port}/`
  }

  @observable browserReady = false

  @lazy() get devServerModel() {
    return new DevServerModel(this)
  }

  @lazy() get buildServerModel() {
    return new BuildServerModel(this)
  }

  @lazy() get browserModel() {
    return new BrowserModel(this)
  }

  async click_develop_locally() {
    await this.devServerModel.start()
    await when(() => this.browserModel.enabled)
    await this.browserModel.click_browser_item()
  }

  static forDir = memoize((dir: string) => new ProjectModel(dir))
}
