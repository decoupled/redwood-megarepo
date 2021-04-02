import * as crypto from "crypto"
import { memoize } from "lodash"
import LRU from "lru-cache"
import * as tsm from "ts-morph"

export function tsm_SourceFile_create(
  filePath: string,
  src: string
): tsm.SourceFile
export function tsm_SourceFile_create(src: string): tsm.SourceFile
/**
 * Creates a cheap in-memory ts-morph source file
 * @param a1
 * @param a2
 */
export function tsm_SourceFile_create(a1: string, a2?: string): tsm.SourceFile {
  let [filePath, src] = [a1, a2]
  if (!a2) {
    src = filePath
    filePath = "/file.tsx"
  }
  return new tsm.Project({
    useInMemoryFileSystem: true,
    skipLoadingLibFiles: true,
    compilerOptions: {
      skipLibCheck: true,
      noLib: true,
      skipDefaultLibCheck: true,
      noResolve: true,
    },
  }).createSourceFile(filePath, src)
}

const getCache = memoize(() => new LRU<string, tsm.SourceFile>(200))

/**
 * warning: do NOT modify the returned file. treat it as immutable.
 * (it will be reused)
 * @param filePath
 * @param text
 */
export function tsm_SourceFile_create_cached(
  filePath: string,
  text: string
): tsm.SourceFile {
  const key = filePath + "\n" + text
  const cache = getCache()
  const key2 = crypto.createHash("sha1").update(key).digest("base64")
  if (cache.has(key2)) {
    return cache.get(key2)!
  } else {
    const sf = tsm_SourceFile_create(filePath, text)
    cache.set(key2, sf)
    return sf
  }
}
