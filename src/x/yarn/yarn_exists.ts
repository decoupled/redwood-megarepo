import ce from "command-exists"

export function yarn_exists(): boolean {
  return ce.sync("yarn") === true
}
