// the build target for the extension
const ext1 = new VSCodeExtension({
  main,
  activationEvents: ["*"],
  publisher: "redwoodjs",
  name: "redwood",
  version: "0.0.22",
  displayName: "Redwood IDE",
  description: "Redwood IDE",
  categories: ["Other"],
  icon,
  contributes: contributes() as any,
  engines: { vscode: "^1.53.0" },
  deps: [redwoodLanguageServerV2],
  staticDir: join(__dirname, "static"),
})

// the entrypoint
function main() {
  return {
    activate(ctx: vscode.ExtensionContext) {
      redwoodjs_vsc(ctx)
    },
    deactivate() {},
  }
}

// let's try it out
{
  // openExtensionOn("git@github.com:redwoodjs/example-blog.git")
  // openExtensionOn("git@github.com:redwoodjs/example-todo.git")
  ext1.dev.buildAndOpen({
    openOnFolder: "/tmp/ff/example-blog",
    disableOtherExtensions: true,
  })
}

// a little dev time helper to test my extension in any redwood app I want
async function openExtensionOn(gitURL: string) {
  const dir = `/tmp/test-projects/${crypto_filenameFriendlyHash(gitURL)}`
  emptyDirSync(dir)
  await degit_with_retries(gitURL, dir)
  ext1.dev.buildAndOpen({ openOnFolder: dir, disableOtherExtensions: true })
}

{
  const openOnFolder =
    "/Users/aldo/code/rw-app-for-testing-new-extension/redwoodblog"
  ext1.dev.buildAndOpen({ openOnFolder, disableOtherExtensions: true })
}

{
  ext1.dev.buildPackageAndShowOutput()
}

function contributes() {
  return merge([
    commands_pjson().contributes,
    lsp_treeview_contributes().contributes,
    treeview_workflow_contributes().contributes,
  ])
}
{
  contributes()
}

import { emptyDirSync } from "fs-extra"
import { VSCodeExtension } from "lambdragon"
import { join } from "path"
import { redwoodLanguageServerV2 } from "src/structure/language_server/redwoodLanguageServerV2"
import { crypto_filenameFriendlyHash } from "src/x/crypto/crypto_filenameFriendlyHash"
import { degit_with_retries } from "src/x/degit/degit_with_retries"
import vscode from "vscode"
import merge from "webpack-merge"
import { commands_pjson } from "./commands/commands"
import { lsp_treeview_contributes } from "./lsp_client/treeview/consts"
import { redwoodjs_vsc } from "./redwoodjs_vsc"
import icon from "./static/redwoodjs_logo.svg"
import { treeview_workflow_contributes } from "./treeview/treeviews"
