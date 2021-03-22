/**
 *
 * @param uriOrFilePath
 * @param sep separator string, defaults to `require('path').sep`
 */
export function URL_toFile(uriOrFilePath: string, sep = path_sep): string {
  if (typeof uriOrFilePath !== "string") throw new Error("arg error")
  if (uriOrFilePath.startsWith(FILE_SCHEME))
    return fileUriToPath(uriOrFilePath, sep)
  const p = normalize(uriOrFilePath)
  if (!isAbsolute(p)) throw new Error("absolute path expected: " + p)
  return p!
}

{
  // test
  const res = `${path_sep}a${path_sep}b.c`
  URL_toFile(`/a/b.c`) === res
  URL_toFile(`file:///a/b.c`) === res
}

{
  // test: works with urlencoded windows file URLs (vscode language server does it this way)
  URL_toFile(`file:///c%3A/a/b.c`, "\\") === "c:\\a\\b.c"
}

const FILE_SCHEME = "file://"

/**
 * based on https://github.com/TooTallNate/file-uri-to-path/blob/master/src/index.ts
 * main changes:
 * - modified to work with VSCode Language Server URIs (they encode colons: "file:///c%3A/a/b.c" )
 * - you can pass "sep", the system separator, (for tests)
 *
 * @param uri
 * @param sep
 */
function fileUriToPath(uri: string, sep = path_sep): string {
  if (
    typeof uri !== "string" ||
    uri.length <= 7 ||
    uri.substring(0, 7) !== FILE_SCHEME
  ) {
    throw new TypeError("must pass in a file:// URI to convert to a file path")
  }

  const rest = decodeURIComponent(uri.substring(7))
  const firstSlash = rest.indexOf("/")
  let host = rest.substring(0, firstSlash)
  let path = rest.substring(firstSlash + 1)

  // 2.  Scheme Definition
  // As a special case, <host> can be the string "localhost" or the empty
  // string; this is interpreted as "the machine from which the URL is
  // being interpreted".
  if (host === "localhost") host = ""
  if (host) host = sep + sep + host

  // 3.2  Drives, drive letters, mount points, file system root
  // Drive letters are mapped into the top of a file URI in various ways,
  // depending on the implementation; some applications substitute
  // vertical bar ("|") for the colon after the drive letter, yielding
  // "file:///c|/tmp/test.txt".  In some cases, the colon is left
  // unchanged, as in "file:///c:/tmp/test.txt".  In other cases, the
  // colon is simply omitted, as in "file:///c/tmp/test.txt".
  path = path.replace(/^(.+)\|/, "$1:")

  const parts = path.split("/")

  // if the first segment is NOT a windows drive
  // we insert an extra empty segment
  // this will result in an initial slash (unix style)
  if (!parts[0].includes(":")) parts.unshift("")

  return parts.join(sep)
}

import { isAbsolute, normalize, sep as path_sep } from "path"
