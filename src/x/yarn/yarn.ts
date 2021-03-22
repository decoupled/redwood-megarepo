import { spawn } from "child_process"

/**
 * calls yarn via execa
 * @param script
 * @param cwd
 */
export function yarn(script: string, cwd = process.cwd()) {
  spawn("yarn", [script], {
    cwd,
    stdio: ["ignore", "inherit", "inherit"],
  })
}
