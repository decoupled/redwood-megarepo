import semver from "semver"
import { framework_version__installed } from "./framework_version__installed"

export function framework_version__installed__satisfies(
  projectRoot: string,
  range: string
): boolean {
  let installed = framework_version__installed(projectRoot)
  if (!installed) return false
  return semver.satisfies(installed, range, {
    includePrerelease: true,
    loose: true,
  })
}
