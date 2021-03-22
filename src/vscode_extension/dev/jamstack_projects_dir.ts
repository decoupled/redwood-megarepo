import os from "os"
import { join } from "path"

export function jamstack_projects_dir() {
  return join(os.homedir(), "jamstack-projects")
}
