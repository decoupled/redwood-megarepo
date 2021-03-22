import execa from "execa"
import { YarnCreatePackageName } from "src/x/yarn/YarnCreatePackageName"
import { yarn_or_npm } from "src/x/yarn/yarn_or_npm"
import vscode from "vscode"
import { TargetDirSpecification } from "../util/TargetDirSpecification"
import { TargetDirSpecification_resolve_vsc } from "../util/TargetDirSpecification_resolve_vsc"

interface Opts {
  packageName: YarnCreatePackageName
  targetDir: TargetDirSpecification
}
export async function yarn_create_dry(opts: Opts) {
  const { packageName, targetDir } = opts
  const tool = yarn_or_npm()
  if (!tool) {
    return
  }
  const dest = await TargetDirSpecification_resolve_vsc({
    targetDir,
    autoNamePrefix: packageName.shortName,
  })
  if (!dest) return
  const cmd = packageName.commandFor(tool)
  return { cmd, dest }
}

export async function yarn_create(opts: Opts) {
  const rr = await yarn_create_dry(opts)
  if (!rr) return
  const { cmd: cmdstr, dest } = rr
  const cmdstr2 = cmdstr + " " + dest
  const [cmd, ...args] = cmdstr2.split(" ")
  const res = await vscode.window.withProgress(
    {
      title: `running "${cmdstr2}"`,
      location: vscode.ProgressLocation.Notification,
    },
    () => execa(cmd, args)
  )
  return vscode.Uri.file(dest)
}
