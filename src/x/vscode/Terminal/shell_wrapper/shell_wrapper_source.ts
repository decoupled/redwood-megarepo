import { readFileSync } from "fs-extra"
import { join } from "path"

// run a little macro to "embed" the contents of the adjacent JS script
export const shell_wrapper_source = x9.preval(() =>
  readFileSync(join(__dirname, "shell_wrapper.js")).toString()
)

{
  shell_wrapper_source
}
