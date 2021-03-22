import { join } from "path"

import { readJSONSync } from "fs-extra"

/**
 * gets the installed framework version by looking into node_modules
 * @param projectRoot
 */
export function framework_version__installed(projectRoot: string) {
  try {
    const pp = join(projectRoot, "node_modules/@redwoodjs/core/package.json")
    const v = readJSONSync(pp).version
    if (typeof v === "string") {
      return v
    }
  } catch (e) {
    return undefined
  }
}
