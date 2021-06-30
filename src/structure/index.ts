export { DiagnosticSeverity } from "vscode-languageserver"
export { DefaultHost, Host } from "./hosts"
export { RWProject } from "./model"
import {
  ExtendedDiagnostic_format,
  GetSeverityLabelFunction
} from "src/x/vscode-languageserver-types"
import { DefaultHost } from "./hosts"
import { RWProject } from "./model"

export function getProject(projectRoot: string, host = new DefaultHost()) {
  return new RWProject({
    projectRoot,
    host,
  })
}

export async function printDiagnostics(
  projectRoot: string,
  opts?: { getSeverityLabel?: GetSeverityLabelFunction }
) {
  const project = getProject(projectRoot)
  const formatOpts = { cwd: projectRoot, ...opts }
  try {
    let exceptions = 0
    for (const d of await project.collectDiagnostics()) {
      const str = ExtendedDiagnostic_format(d, formatOpts)
      console.log(str)
      // counts number of warnings (2) and errors (1) encountered
      if (d.diagnostic.severity === 2 || d.diagnostic.severity === 1) {
        exceptions++
      }
    }

    if (exceptions === 0) {
      console.log("Success: no errors or warnings were detected")
    }
  } catch (e) {
    console.log("runtime error: " + e.message)
  }
}
