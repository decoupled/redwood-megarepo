import command_exists from "command-exists"
import { existsSync } from "fs-extra"
import { join } from "path"
import { getPortPromise } from "portfinder"
import vscode from "vscode"
import waitPort from "wait-port"
import { wait } from "src/x/Promise/wait"
// import { jamstackide_vsc_treeview_get } from "../treeview/jamstackide_vsc_treeview"
import { browser_preview } from "./browser_preview"
import { ExtraOpts } from "./develop_locally"
import { vscode_run } from "src/x/vscode/vscode_run"

interface Opts {
  uri: vscode.Uri
  ctx: vscode.ExtensionContext
  extraOpts?: ExtraOpts
}

export async function start_dev(opts: Opts) {
  const { uri, ctx, extraOpts } = opts

  // focus on the explorer view
  vscode.commands.executeCommand("workbench.view.explorer")
  // try to focus the jamstack treeview
  // jamstackide_vsc_treeview_get(ctx).reveal()

  const cmds: string[] = []

  // analyze
  throw new Error("TODO")
  const settings = null as any // await netlify_dev_dry_settings(uri.fsPath)
  let use_netlify_dev = true

  let port = await getPortPromise()

  const netlify_dev_flags: string[] = []

  if (extraOpts?.framework === "redwood") {
    use_netlify_dev = false
    false &&
      netlify_dev_flags.push(
        "--command='yarn rw dev' --framework='#custom' --targetPort=8910"
      )
    cmds.push(`yarn rw dev --fwd="--port=${port} --open=false"`)
    //port = 8910
  } else if (settings?.framework === "gatsby") {
    use_netlify_dev = false
    cmds.push("yarn gatsby develop -p " + port)
    //cmds.push(`netlify dev -p `)
    // for now we're not using netlify dev
    // we have no way of overriding targetPort cleanly
  }

  // we will specify a port for netlify dev

  // -c, --command=command      command to run
  // -f, --functions=functions  Specify a functions folder to serve
  // -o, --offline              disables any features that require network access
  // -p, --port=port            Specify port of netlify dev
  // -l, --live                 Start a public live session
  // const flags: string[] = []
  // if (overrideCommand) flags.push(`-c '${overrideCommand}'`)
  if (use_netlify_dev) {
    netlify_dev_flags.push("-p " + port)
    const has_netlify = command_exists.sync("netlify")
    if (!has_netlify) cmds.push("npm i -g netlify-cli")
    cmds.push(["netlify dev", ...netlify_dev_flags].join(" "))
  }

  const runn = async () => {
    for (const cmd of cmds)
      await vscode_run({ cmd, name: "Jamstack Dev", cwd: uri.fsPath })
  }
  runn()

  const urlll = `http://localhost:${port}/`

  await waitPort({ port })
  if (settings?.framework === "gatsby") {
    // gatsby develop will start a server that keeps http requests open
    // during startup. It can take 10, 20 seconds
    // so we have a special heuristic for this case
    await wait(3000)
    // await gatsby_wait_for_dev_server_ready({ port })
    await wait(1000)
  } else {
    // give it some time anyway.
    // the vscode browser preview will fail if the HTTP request is not fulfilled immediately
    await wait(3000)
  }

  // TODO
  // const app = express()
  // app.use(bodyParser.json())
  // app.use(cors())
  // app.post("/browser-route-change", (req, res) => {
  //   const location = req.body
  // })
  // app.listen(6734)

  await browser_preview(urlll)

  //open(urlll)

  // open file
  openFile(opts)
}

async function openFile({ extraOpts, uri }: Opts) {
  const candidates1 = ["pages/index.js", "src/pages/index.js", "src/index.js"]
  if (extraOpts?.open) {
    candidates1.unshift(extraOpts.open)
  }
  const candidates = candidates1.map((x) => join(uri.fsPath, x))
  const ff = candidates.find((x) => {
    return existsSync(x.split(":")[0])
  })
  if (ff) {
    const [file, line, col] = ff.split(":")
    const selection = parseRange(line, col)
    const uri = vscode.Uri.file(file)
    await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(uri, { selection })
  }
}

function parseRange(
  line: string = "",
  col: string = ""
): vscode.Range | undefined {
  const lineN = parseInt(line)
  if (isNaN(lineN)) return
  const colN = isNaN(parseInt(col)) ? 0 : parseInt(col)
  const pp = new vscode.Position(lineN, colN)
  return new vscode.Range(pp, pp)
}
