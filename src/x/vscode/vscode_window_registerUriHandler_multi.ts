import { Memoize as memo } from "lodash-decorators"
import vscode from "vscode"

/**
 * vscode only lets you register up to one handler per extension
 * this will multiplex the subscription
 * @param handler
 */
export function vscode_window_registerUriHandler_multi(
  handler: vscode.UriHandler
): vscode.Disposable {
  return Registry.instance.add(handler)
}

class Registry implements vscode.UriHandler {
  handlers = new Set<vscode.UriHandler>()
  @memo() private lazyInit() {
    vscode.window.registerUriHandler(this)
  }
  handleUri(uri: vscode.Uri) {
    for (const h of this.handlers) h.handleUri(uri)
  }
  add(h: vscode.UriHandler) {
    this.lazyInit()
    this.handlers.add(h)
    return {
      dispose: () => {
        this.handlers.delete(h)
      },
    }
  }
  static instance = new Registry()
}
