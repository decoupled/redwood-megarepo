/**
 * Creates a file:// URL
 * Works with linux and windows paths
 * If the passed in value is already as file:// URL, it returns that same value
 * TOOD: rename to URL_fromFile
 * @param filePath
 */
export function URL_fromFile(filePath: string, ...parts: string[]): string {
  if (filePath.startsWith(FILE_SCHEME))
    filePath = filePath.substr(FILE_SCHEME.length)
  if (parts.length > 0) filePath = join(filePath, ...parts)
  return new URL(FILE_SCHEME + normalize(filePath)).href
}

const FILE_SCHEME = "file://"

{
  // test: windows style paths
  URL_fromFile(`\\a\\b.c`) === "file:///a/b.c"
  URL_fromFile(`\\a\\b.c`) === "file:///a/b.c"
  URL_fromFile(`C:\\a`, `b.c`) === "file:///C:/a/b.c"
}

{
  // test: linux style paths
  URL_fromFile(`/a/b.c`) === "file:///a/b.c"
  URL_fromFile(`/a`, "b.c") === "file:///a/b.c"
}

{
  // test: file:// URLs
  URL_fromFile("file:///a/b.c") === "file:///a/b.c"
  URL_fromFile(`file:///a`, "b.c") === "file:///a/b.c"
}

import { join, normalize } from "path"
