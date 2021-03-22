import execa from "execa"
import { npm__yarn__pick_best_for_project } from "./npm__yarn__pick_best_for_project"

/**
 * runs npm install or yarn install.
 * it will look for package-lock.json and yarn.lock
 */
export async function npm__yarn__install(cwd: string, which = ["yarn", "npm"]) {
  const cmdstr = await npm__yarn__install_dry(cwd, which)
  if (!cmdstr) return undefined
  const [cmd, ...args] = cmdstr.split(" ")
  return await execa(cmd, args, { cwd })
}

export async function npm__yarn__install_dry(
  cwd: string,
  which = ["yarn", "npm"]
) {
  const ff = await npm__yarn__pick_best_for_project(cwd, which)
  if (!ff) return undefined
  const cmdstr = ff === "yarn" ? "yarn" : "npm install"
  return cmdstr
}
