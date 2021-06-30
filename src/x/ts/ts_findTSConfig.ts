import { normalize } from "path"

import fup from "findup-sync"
import { memoize } from "lodash"

export const ts_findTSConfig = memoize((path: string): string | undefined => {
  const cwd = normalize(path)
  if (cwd !== path) return ts_findTSConfig(cwd)
  return fup(["tsconfig.json", "jsconfig.json"], { cwd }) ?? undefined
})