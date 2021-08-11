import { vscode_run, wait } from "@decoupled/xlib"
import execa from "execa"
import { join } from "path"
import { URLWatcher } from "src/x/http/URLWatcher"
import vscode, { ProgressLocation } from "vscode"
import { commands_debug } from "./commands"
import dotenv_defaults from "dotenv-defaults"
import { readFileSync } from "fs"
import { framework_version__installed__satisfies } from "../util/framework_version__installed__satisfies"

export function debug_activate(ctx: vscode.ExtensionContext): void {
  ctx.subscriptions.push(
    commands_debug.register(async () => {
      const wf = (vscode.workspace.workspaceFolders ?? [])[0]
      if (!wf) return
      const cwd = wf.uri.fsPath
      const version_range = ">=0.32.1"
      if (!framework_version__installed__satisfies(cwd, version_range)) {
        vscode.window.showWarningMessage(
          `Debugging is only available in Redwood ${version_range}`
        )
        return
      }
      vscode.window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: "Starting Redwood Debugger",
        },
        () => start_debug(cwd)
      )
    })
  )
}

async function start_debug(cwd: string): Promise<void> {
  // start api side
  {
    const program = join(
      cwd,
      "node_modules/@redwoodjs/api-server/dist/watch.js"
    )
    // const program = join(
    //   base,
    //   "node_modules/@redwoodjs/dev-server/dist/main.js"
    // )
    // const program2 = `yarn cross-env NODE_ENV=development NODE_OPTIONS=--enable-source-maps yarn nodemon --watch "${redwoodConfigPath}" --exec "yarn rw-api-server-watch"`

    const dev_server_config: vscode.DebugConfiguration = {
      type: "node",
      request: "launch",
      name: "Redwood Api",
      cwd: join(cwd, "api"),
      skipFiles: ["<node_internals>/**"],
      sourceMaps: true,
      program,
      outFiles: [join(cwd, "api", "dist") + "/**/*.js"],
      env: {
        ...load_env(cwd),
        NODE_ENV: "development",
        NODE_OPTIONS: "--enable-source-maps",
      },
    }
    await vscode.debug.startDebugging(undefined, dev_server_config)
  }

  // start web side
  {
    // const cmd = `yarn rw dev web`
    const cmd = `yarn rw dev web --fwd="--no-open"`
    if (false) {
      execa(cmd, { cwd })
    } else {
      vscode_run({ cmd, cwd })
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
      webRoot: cwd,
    }
    await vscode.debug.startDebugging(undefined, browser_config)
  }
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
