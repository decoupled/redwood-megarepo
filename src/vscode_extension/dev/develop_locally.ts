import { existsSync, removeSync } from "fs-extra"
import { values } from "lodash"
import { Memoize as memo } from "lodash-decorators"
import { join } from "path"
import { GitURL } from "src/x/git/GitURL"
import { npm__yarn__install_dry } from "src/x/npm__yarn/npm__yarn__install"
import { wait } from "src/x/Promise/wait"
import { shell_wrapper_run_or_fail } from "src/x/vscode/Terminal/shell_wrapper/shell_wrapper_run"
import { vscode_run } from "src/x/vscode/vscode_run"
import { vscode_window_createTerminal_andRun } from "src/x/vscode/vscode_window_createTerminal_andRun"
import vscode, { Uri } from "vscode"
import { Command } from "vscode-languageserver-types"
import {
  NewJamstackProjectSource,
  NewJamstackProjectSourceString,
  NewJamstackProjectSource_autoPickDir,
  NewJamstackProjectSource_parse
} from "../util/NewJamstackProjectSource"
import { NewJamstackProjectSource_prompt } from "../util/NewJamstackProjectSource_prompt"
import { TargetDirSpecification } from "../util/TargetDirSpecification"
import { clone_repo } from "./clone_repo"
import { init_hook_set_and_open } from "./init_hook"
import { jamstack_projects_dir } from "./jamstack_projects_dir"
import { start_dev } from "./start_dev"
import { yarn_create_dry } from "./yarn_create"

export const commands = {
  // this is a public facing command
  develop_locally: {
    command: "redwoodjs.redwood.develop_locally",
    title: "Fetch and Develop Locally",
    category: "Redwood",
  }
}

export function ___buildmeta___() {
  return {
    pjson: {
      contributes: {
        commands: [...values(commands)],
      },
    },
  }
}

export type Opts =
  | FromMagicURL
  | InitAfterReload
  | FromCommandInvocation
  | FromNetlifyExplorer

interface FromMagicURL {
  action: "FromMagicURL"
  source?: NewJamstackProjectSourceString
  extraOpts?: ExtraOpts
}

export interface ExtraOpts {
  /**
   * relative path to a file to open upon launching
   */
  open?: string
  /**
   * override netlify-dev framework
   */
  framework?: string
  /**
   * provide a command run start dev
   * TODO: prompt user for authorization
   */
  command?: string
  /**
   * override the install command
   * TODO: prompt user for authorization
   */
  install?: string

  /**
   * use degit instead of git clone
   */
  degit?: boolean
}

interface FromNetlifyExplorer {
  action: "FromNetlifyExplorer"
  source: NewJamstackProjectSourceString
}

export interface FromCommandInvocation {
  action: "FromCommandInvocation"
  source?: NewJamstackProjectSourceString
}

interface InitAfterReload {
  action: "InitAfterReload"
  source: NewJamstackProjectSourceString
  workspaceUri: string
  extraOpts?: ExtraOpts
}

export function develop_locally(opts: Opts, ctx: vscode.ExtensionContext) {
  return new DevelopLocally(opts, ctx).start()
}

class DevelopLocally {
  constructor(private opts: Opts, private ctx: vscode.ExtensionContext) {}
  @memo() async start() {
    const opts = this.opts
    const { ctx } = this

    if (opts.action === "FromCommandInvocation") {
      const source = await NewJamstackProjectSource_prompt()
      if (!source) return
      reload_and_init({ source, openInNewWindow: true, ctx })
      return
    }

    if (opts.action === "FromNetlifyExplorer") {
      const source = opts.source
        ? NewJamstackProjectSource_parse(opts.source)
        : await NewJamstackProjectSource_prompt()
      if (!source) return
      reload_and_init({ source, openInNewWindow: true, ctx })
      return
    }

    if (opts.action === "FromMagicURL") {
      const source = opts.source
        ? NewJamstackProjectSource_parse(opts.source)
        : await NewJamstackProjectSource_prompt()
      if (!source) return
      const wfs = vscode.workspace.workspaceFolders ?? []
      const openInNewWindow = wfs.length > 0
      reload_and_init({
        source,
        openInNewWindow,
        ctx,
        extraOpts: opts.extraOpts,
      })
      return
    }

    if (opts.action === "InitAfterReload") {
      const { workspaceUri, extraOpts } = opts
      const wf = requireAtLeastOneOpenWorkspace(workspaceUri)
      const source = NewJamstackProjectSource_parse(opts.source)

      hideAll()

      // we should also make sure the panel and the terminals are closed
      // workbench.action.terminal.toggleTerminal

      // TODO: open animation (for now this is totally disconnected)
      // jamstackide_dev_animation_open(this.ctx)

      const targetDir: TargetDirSpecification = {
        kind: "specific",
        dir: wf.uri.fsPath,
      }
      // fetch code

      // delete the .jamstackide folder if present
      // otherwise "git clone" and "yarn create" won't work
      removeSync(join(wf.uri.fsPath, ".jamstackide"))

      if (source instanceof GitURL) {
        const clone_opts = {
          gitUrl: source,
          targetDir,
          degit: extraOpts?.degit,
        }
        await clone_repo(clone_opts)
        // const rr = await clone_repo_dry(clone_opts)
        // if (!rr) return
        // await run({ cmd: rr })
        // await jamstackide_shell_wrapper_run_or_fail(rr, cmd => {
        //   vscode_window_createTerminal_andRun({ cmd })
        // })
        //await npm__yarn__install(wf.uri.fsPath)
        const ok = await install_deps({ dir: wf.uri.fsPath, extraOpts })
        if (!ok) return
      } else {
        // yarn create
        const opts = {
          packageName: source,
          targetDir,
        }
        //await yarn_create(opts)
        const rr = await yarn_create_dry(opts)
        if (!rr) return
        const cmdstr2 = rr.cmd + " " + rr.dest
        await vscode_run({ cmd: cmdstr2 })
      }
      restartEverything()

      // start dev
      await start_dev({ uri: wf.uri, ctx: this.ctx, extraOpts })
      return
    }
  }
}

async function restartEverything() {
  // PERFORMANCE
  // performance can be sluggish at this point
  // (many files changed, some language servers are going nuts at this point)
  // restart ts server - this seems to help
  // if performance becomes an issue at this point, we could also restart the extension host
  // this would restart *this* extension, but with some trickery we could pull it off
  // workbench.action.restartExtensionHost
  try {
    await vscode.commands.executeCommand("typescript.restartTsServer")
  } catch (e) {}
}

async function install_deps_dry(opts: {
  dir: string
  extraOpts?: ExtraOpts
}): Promise<string[] | undefined> {
  const { extraOpts, dir } = opts
  if (extraOpts?.install) {
    const install_cmd = extraOpts.install
    // some known commands are whitelisted
    if (install_cmd === "bundle install") {
      // https://jekyllrb.com/tutorials/using-jekyll-with-bundler/
      // install dependencies locally to avoid permission issues
      // TODO: add this line to .gitignore
      return bundle_install_cmd()
    } else {
      vscode.window.showWarningMessage(
        `custom install commands not implemented yet: ${install_cmd}`
      )
      return
    }
  } else {
    // guess
    const gemfile = join(dir, "Gemfile")
    if (existsSync(gemfile)) {
      return bundle_install_cmd()
    }
    const npmi = await npm__yarn__install_dry(dir)
    return npmi ? [npmi] : undefined
  }
}

function bundle_install_cmd() {
  // TODO: check for bundle installation
  const line1 = `bundle config set --local path '.vendor/bundle'`
  const line2 = "bundle install"
  return [line1, line2]
}

async function install_deps(opts: { dir: string; extraOpts?: ExtraOpts }) {
  const cmds = await install_deps_dry(opts)
  if (!cmds) return false
  for (const cmd of cmds)
    await shell_wrapper_run_or_fail(cmd, (cmd) => {
      vscode_window_createTerminal_andRun({ cmd, cwd: opts.dir })
    })
  return true
}

async function reload_and_init({
  source,
  dir,
  openInNewWindow,
  ctx,
  extraOpts,
}: {
  source: NewJamstackProjectSource
  dir?: string
  openInNewWindow?: boolean
  ctx: vscode.ExtensionContext
  extraOpts?: ExtraOpts
}) {
  const dev = ctx.extensionMode === vscode.ExtensionMode.Development
  if (dev) {
    openInNewWindow = false // otherwise we would get a window with no extension
    // close any open workspace folders and wait a bit
    const wfs = vscode.workspace.workspaceFolders
    if (wfs && wfs.length > 0) {
      vscode.workspace.updateWorkspaceFolders(0, wfs?.length)
      await wait(1000)
    }
  }
  const dir2 =
    dir ?? NewJamstackProjectSource_autoPickDir(source, jamstack_projects_dir())
  const cmd = {
    command: commands.develop_locally.command,
    arguments: [
      {
        action: "InitAfterReload",
        source: source.raw,
        workspaceUri: Uri.file(dir2).toString(),
        extraOpts,
      } as InitAfterReload,
    ],
    title: "init",
  } as Command
  init_hook_set_and_open(dir2, cmd, openInNewWindow)
}

// function devLaunchMarkerForDir(dir: string): string {
//   return join(dir, ".jamstackide", ".dev")
// }

function requireAtLeastOneOpenWorkspace(uri: string) {
  const wf = vscode.workspace.workspaceFolders?.find(
    (wf) => wf.uri.toString() === uri
  )
  if (!wf) throw new Error(`workspace is not currently open: ${uri}`)
  return wf
}

export function hideAll() {
  vscode.commands.executeCommand("workbench.action.closeAllEditors")
  vscode.commands.executeCommand("workbench.action.closePanel")
  vscode.commands.executeCommand("workbench.action.closeSidebar")
}
/*  vscode.window.state.focused
{ "key": "ctrl+cmd+f",            "command": "workbench.action.toggleFullScreen" },
{ "key": "cmd+j",                 "command": "workbench.action.togglePanel" },
{ "key": "cmd+b",                 "command": "workbench.action.toggleSidebarVisibility" },
*/
