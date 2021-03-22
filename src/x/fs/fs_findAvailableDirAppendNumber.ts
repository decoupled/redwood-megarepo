import { existsSync } from "fs-extra"

export function fs_findAvailableDirAppendNumber(f: string, sep = ""): string {
  for (let i = 1; ; i++) {
    const postfix = i == 1 ? "" : sep + i
    const ff = f + postfix
    if (!existsSync(ff)) return ff
  }
}
