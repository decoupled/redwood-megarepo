import { lazy } from "src/x/decorators"
import vscode from "vscode"

import { vscode_extensions_getExtensionID } from "src/x/vscode/vscode_extensions_getExtensionID"

/**
 * Checks if there is a newer redwood version available and
 * displays a message in the status bar.
 *
 * @param ctx
 * @returns
 */
export async function new_version_message(
  ctx: vscode.ExtensionContext
): Promise<boolean> {
  const ff = new Run(ctx)
  ff.run()
  return ff.preventActivation
}

class Run {
  constructor(private ctx: vscode.ExtensionContext) {}

  async run() {
    const { isOld, hasOld, hasNew } = this
    if (isOld && !hasNew) {
      this.info_please_update()
    }
    if (hasNew && hasOld) {
      this.info_please_uninstall()
    }
  }

  new_id = "redwoodjs.redwood"
  old_id = "decoupled.redwoodjs-ide"
  @lazy() get id() {
    return vscode_extensions_getExtensionID(this.ctx)
  }
  @lazy() get hasNew() {
    return this.hasExtension(this.new_id)
  }
  @lazy() get hasOld() {
    return this.hasExtension(this.old_id)
  }
  @lazy() get isNew() {
    return this.id === this.new_id
  }
  @lazy() get isOld() {
    return this.id === this.old_id
  }
  @lazy() get preventActivation() {
    return this.hasOld && this.hasNew
  }
  private async info_please_uninstall() {
    const msg = `Please uninstall the old version of the Redwood extension ('decoupled.redwoodjs-ide') and restart VSCode`
    await vscode.window.showInformationMessage(msg)
  }
  private async info_please_update() {
    const msg = `The Redwood extension has moved from '${this.old_id}' to '${this.new_id}'.
    Please click on the button below to install the new extension.`
    const new_url = `https://marketplace.visualstudio.com/items?itemName=${this.new_id}`
    const info_url = `https://github.com/redwoodjs/redwood/issues/1409`
    const btn = "Install New Redwood Extension"
    const btn2 = "Learn More..."
    const res = await vscode.window.showInformationMessage(msg, btn, btn2)
    if (res === btn) {
      vscode.env.openExternal(vscode.Uri.parse(new_url))
    }
    if (res === btn2) {
      vscode.env.openExternal(vscode.Uri.parse(info_url))
    }
  }
  private hasExtension(id: string): boolean {
    return typeof vscode.extensions.getExtension(id) !== "undefined"
  }
}
