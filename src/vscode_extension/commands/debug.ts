import { vscode_run, wait } from "@decoupled/xlib"
import execa from "execa"
import { join } from "path"
import { URLWatcher } from "src/x/http/URLWatcher"
import vscode from "vscode"
import { commands_debug } from "./commands"
import dotenv_defaults from "dotenv-defaults"
import { readFileSync } from "fs"

export function debug_activate(ctx: vscode.ExtensionContext): void {
  ctx.subscriptions.push(
    commands_debug.register(async () => {
      const wf = (vscode.workspace.workspaceFolders ?? [])[0]
      if (!wf) return
      const base = wf.uri.fsPath

      // start api side
      {
        const program = join(
          base,
          "node_modules/@redwoodjs/dev-server/dist/main.js"
        )
        const dev_server_config: vscode.DebugConfiguration = {
          type: "node",
          request: "launch",
          name: "Redwood Api",
          cwd: join(base, "api"),
          skipFiles: ["<node_internals>/**"],
          sourceMaps: true,
          program,
          env: { ...load_env(base), NODE_ENV: "development" },
        }
        await vscode.debug.startDebugging(undefined, dev_server_config)
      }

      // start web side
      {
        if (false) {
          execa("yarn rw dev web", { cwd: base })
        } else {
          const cmd = `yarn rw dev web --fwd="--open=false"`
          vscode_run({ cmd, cwd: base })
        }
      }

      // launch browser
      {
        // wait for web server to be ready
        await new URLWatcher({
          url: `http://localhost:8910/`,
        }).waitForNextOK()

        const browser_config = {
          name: "Redwood Web (Chrome)",
          request: "launch",
          type: "pwa-chrome",
          url: "http://localhost:8910/",
          webRoot: base,
        }
        await vscode.debug.startDebugging(undefined, browser_config)
      }
    })
  )
}

{
  load_env("/Users/aldo/com.github/redwoodjs/example-blog")
}

/**
 * for some reason, when starting the dev server manually, dotenv() doesn't
 * get called correctly.
 * so instead we resolve the env vars manually and then set them on the process
 */
function load_env(cwd: string) {
  return dotenv_defaults.parse(
    load(join(cwd, ".env")),
    load(join(cwd, ".env.defaults"))
  )
  function load(f: string) {
    try {
      return readFileSync(f).toString()
    } catch (e) {}
    return ""
  }
}
