import { join } from "path"

import { outputFileSync, readFileSync } from "fs-extra"
import proxyquire from "proxyquire"

import { spawnCancellable } from "src/x/child_process"

import { RedwoodCommandString } from "./RedwoodCommandString"

export type FileSet = { [filePath: string]: string | null }

interface Opts {
  /**
   * redwood project root (filepath)
   */
  cwd: string
  /**
   * Command to execute
   */
  cmd: RedwoodCommandString
  /**
   * Files to override
   */
  fileOverrides?: FileSet
  /**
   * directory to store the temporary generated JS script
   */
  tmpdir?: string
}

export async function interactive_cli_dry_run(
  opts: Opts
): Promise<{ stdout: string; files: FileSet }> {
  const { cwd, cmd, fileOverrides, tmpdir } = opts
  if (!cmd.isComplete)
    throw new Error(
      "cannot pass an interactive command straight to the redwood-cli. You must run it through the command_builder first"
    )
  // eslint-disable-next-line
  const x = [proxyquire].length // we need to make sure this module is required. it will be used in a script we will generate dynamically
  const tempDir = tmpdir ?? join(cwd, ".tmp")
  const jsfile = join(tempDir, "rwcli.js")
  const requireStatement = "proxyquire"
  outputFileSync(jsfile, buildJS(fileOverrides, requireStatement))
  const cmdargs = "node " + jsfile + " " + cmd.processed
  const [cmd2, ...args] = cmdargs.split(" ")
  // TODO: use execa
  const { stdout: out, stderr } = await spawnCancellable(cmd2, args, {
    cwd,
  })
  if (stderr) {
    throw new Error(stderr)
  }
  //const out = execSync(cmdargs, { cwd: projectRoot })
  const [stdout, jsondata] = out.toString().split(separator)
  return { stdout, files: JSON.parse(jsondata) }
}

const separator = "---------===----===--------"

function buildJS(
  fileOverrides: FileSet = {},
  proxyquireRequireStatement = "proxyquire"
) {
  let js = script_for_embedding
  // replace some placeholders in the template
  js = js.replace(`{ FILE: "OVERRIDES" }`, JSON.stringify(fileOverrides))
  js = js.replace(`"__SEPARATOR__"`, JSON.stringify(separator))
  js = js.replace(
    `require("proxyquire")`,
    `require("${proxyquireRequireStatement}")`
  )
  return js
}

// run a little macro to "embed" the contents of the adjacent JS script
const script_for_embedding = x9.preval(() =>
  readFileSync(join(__dirname, "dry_run_script.js")).toString()
)

{
  script_for_embedding
}
