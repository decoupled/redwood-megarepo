import vscode from "vscode"
import { commands_generate, commands_show_outline } from "./commands"

export function commands_activate(ctx: vscode.ExtensionContext) {
  const { executeCommand } = vscode.commands
  ctx.subscriptions.push(
    commands_generate.register(async () => {
      executeCommand("redwoodjs.cli", "generate...")
    }),
    commands_show_outline.register(async () => {
      // TODO: reveal outline
    })
  )

  // registerCommand(c.redwood_debug.command, async () => {
  //   const wf = (vscode.workspace.workspaceFolders ?? [])[0]
  //   if (!wf) return
  //   const base = wf.uri.fsPath
  //   const runtimeExecutable = join(base, "node_modules/.bin/babel-node")
  //   const program = join(
  //     base,
  //     "node_modules/@redwoodjs/dev-server/dist/dev-server2.js"
  //   )
  //   const cfg1: vscode.DebugConfiguration = {
  //     type: "node",
  //     request: "launch",
  //     name: "Redwood Api (Functions)",
  //     cwd: join(base, "api"),
  //     skipFiles: ["<node_internals>/**"],
  //     sourceMaps: true,
  //     runtimeExecutable,
  //     program,
  //   }
  //   await vscode.debug.startDebugging(undefined, cfg1)
  //   // launch web
  //   if (false) {
  //     execa("yarn rw dev web", { cwd: base })
  //   } else {
  //     const t = vscode.window.createTerminal({
  //       name: "yarn rw dev web",
  //       cwd: base,
  //     })
  //     executeCommand("workbench.action.terminal.clear")
  //     t.sendText("clear")
  //     t.sendText("clear")
  //     t.show()
  //     t.sendText(`yarn rw dev web --fwd="--open=false"`)
  //   }
  //   await wait(3000)
  //   const cfg2 = {
  //     name: "Redwood Web (Chrome)",
  //     request: "launch",
  //     type: "pwa-chrome",
  //     url: "http://localhost:8910/",
  //     webRoot: base,
  //   }
  //   await vscode.debug.startDebugging(undefined, cfg2)
  // })
}
