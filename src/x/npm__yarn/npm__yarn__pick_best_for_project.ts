import command_exists from "command-exists"
import { existsSync } from "fs-extra"
import { join } from "path"
import * as xlib from "@decoupled/xlib"


/**
 * returns the command string you should call
 * "yarn" or "npm".
 * if neither is found, returns undefined
 * @param cwd
 * @param which
 */
export async function npm__yarn__pick_best_for_project(
  cwd: string,
  which = ["yarn", "npm"]
): Promise<"yarn" | "npm" | undefined> {
  const available = await xlib.Array_filter_async(which, cmd_exists)
  const has_yarn_lock = existsSync(join(cwd, "yarn.lock"))
  const has_npm_lock = existsSync(join(cwd, "package-lock.json"))
  if (has_yarn_lock && available.includes("yarn")) return "yarn"
  if (has_npm_lock && available.includes("npm")) return "npm"
  if (available.includes("yarn")) return "yarn"
  if (available.includes("npm")) return "npm"
}

async function cmd_exists(c: string) {
  return !!command_exists.sync(c)
}
