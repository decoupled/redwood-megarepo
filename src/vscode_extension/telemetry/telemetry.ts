import { memoize } from "lodash"
import { userInfo } from "os"
import { sep } from "path"
import { lazy } from "src/x/decorators"
import { vscode_extensions_getExtensionID } from "src/x/vscode/vscode_extensions_getExtensionID"
import vscode from "vscode"
import TelemetryReporter from "vscode-extension-telemetry"

export const telemetry_activate = memoize((ctx: vscode.ExtensionContext) => {
  return new Reporter(ctx)
})

// most code taken from: https://github.com/Almenon/AREPL-vscode/blob/master/src/areplUtilities.ts

class Reporter {
  private reporter: TelemetryReporter
  private timeActivated = 0
  private lastStackTrace = ""

  constructor(public ctx: vscode.ExtensionContext) {
    this.timeActivated = 0
    const extensionId = vscode_extensions_getExtensionID(ctx)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const extension = vscode.extensions.getExtension(extensionId)!
    const extensionVersion = extension.packageJSON.version

    // make it harder for bots
    const k1 = "67b2b5a8-4d36-469c"
    const k2 = "-8147-bf438d007b6b"
    const k = [k1, k2].join("")

    this.reporter = new TelemetryReporter(extensionId, extensionVersion, k)
    this.event_activate()
  }

  get enableTelemetry() {
    return (
      vscode.workspace.getConfiguration().get("telemetry.enableTelemetry") !==
      false
    )
  }

  get enableCrashReporter() {
    return (
      vscode.workspace
        .getConfiguration()
        .get("telemetry.enableCrashReporter") !== false
    )
  }

  sendError(error: Error, code = 0, category = "typescript") {
    console.error(
      `${category} error: ${error.name} code ${code}\n${error.stack}`
    )
    if (this.enableTelemetry) {
      error.stack = this.anonymizePaths((error as any).stack)

      // no point in sending same error twice (and we want to stay under free API limit)
      if (error.stack == this.lastStackTrace) {
        return
      }

      this.reporter.sendTelemetryException(error, {
        code: code.toString(),
        category,
      })

      this.lastStackTrace = error.stack
    }
  }

  get elapsedTimeSinceActivation() {
    return Date.now() - this.timeActivated
  }

  private sendFinishedEvent(settings: vscode.WorkspaceConfiguration) {
    if (this.enableTelemetry) {
      const measurements: { [key: string]: number } = {}
      measurements["timeSpent"] = (Date.now() - this.timeActivated) / 1000

      const properties: { [key: string]: string } = {}

      // no idea why I did this but i think there was a reason?
      // this is why you leave comments people
      const settingsDict = JSON.parse(JSON.stringify(settings))
      for (const key in settingsDict) {
        properties[key] = settingsDict[key]
      }

      // properties['pythonPath'] = this.anonymizePaths(areplUtils.getPythonPath())
      // properties['pythonVersion'] = this.pythonVersion
      this.reporter.sendTelemetryEvent("closed", properties, measurements)
    }
  }

  /**
   * replace username with anon
   */
  anonymizePaths(input: string) {
    if (input == null) {
      return input
    }
    return input.replace(
      new RegExp("\\" + sep + userInfo().username, "g"),
      sep + "anon"
    )
  }

  @lazy() get extensionMode_string() {
    const mm = vscode.ExtensionMode
    const m = {
      [mm.Production]: "production",
      [mm.Development]: "development",
      [mm.Test]: "test",
    }
    return m[this.ctx.extensionMode]
  }
  private processProperties(properties?: Properties) {
    const base = {
      extensionMode: this.extensionMode_string,
    }
    return { ...base, ...(properties ?? {}) }
  }

  private get enabled() {
    if (!this.enableTelemetry) {
      return false
    }
    if (this.ctx.extensionMode === vscode.ExtensionMode.Test) {
      return false
    }
    return true
  }

  sendTelemetryEvent(
    eventName: string,
    properties?: Properties,
    measurements?: Measurements
  ): void {
    if (!this.enabled) {
      return
    }
    this.reporter.sendTelemetryEvent(
      eventName,
      this.processProperties(properties),
      measurements
    )
  }
  sendTelemetryErrorEvent(
    eventName: string,
    properties?: Properties,
    measurements?: Measurements,
    errorProps?: string[]
  ): void {
    if (!this.enabled) {
      return
    }
    this.reporter.sendTelemetryErrorEvent(
      eventName,
      this.processProperties(properties),
      measurements,
      errorProps
    )
  }
  sendTelemetryException(
    error: Error,
    properties?: Properties,
    measurements?: Measurements
  ): void {
    if (!this.enabled) {
      return
    }
    this.reporter.sendTelemetryException(
      error,
      this.processProperties(properties),
      measurements
    )
  }

  dispose() {
    this.event_deactivate()
    this.reporter.dispose()
  }

  // we call this one ourselves
  private event_activate() {
    this.sendTelemetryEvent("activate", {}, {})
  }
  event_deactivate() {
    this.sendTelemetryEvent("deactivate", {}, {})
  }
  event_redwoodProjectDetected(props: { redwoodVersion: string }) {
    this.sendTelemetryEvent("redwoodProjectDetected", props, {})
  }
}

type Properties = {
  [key: string]: string
}
type Measurements = {
  [key: string]: number
}
