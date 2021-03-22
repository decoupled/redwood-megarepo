import { join } from "path"
import { fs_findAvailableDirAppendNumber } from "src/x/fs/fs_findAvailableDirAppendNumber"
import { GitURL } from "src/x/git/GitURL"
import { YarnCreatePackageName } from "src/x/yarn/YarnCreatePackageName"

export type NewJamstackProjectSourceString = string
export type NewJamstackProjectSource = YarnCreatePackageName | GitURL

export function NewJamstackProjectSource_parse(
  str: NewJamstackProjectSourceString
): NewJamstackProjectSource {
  if (str.startsWith("create-") && !str.includes("/")) {
    return YarnCreatePackageName.parse(str)
  } else {
    return GitURL.parse(str)
  }
}

{
  const p = NewJamstackProjectSource_parse
  p("https://github.com/foo/bar") instanceof GitURL
  p("git@github.com:redwoodjs/redwood.git") instanceof GitURL
  p("https://github.com/foo/bar.git") instanceof GitURL
  p("foo/bar") instanceof GitURL
  p("create-redwood-app") instanceof YarnCreatePackageName
  p("create-other-app") instanceof YarnCreatePackageName
  // expect(() => p("hello")).toThrow()
}

/**
 * finds an available directory within root with a name that is derived from this source's name
 * for example:
 * https://github.com/someorg/somerepo ---> root/somerepo2
 * create-foo-bar --> root/foo-bar3
 * @param source
 * @param root
 */
export function NewJamstackProjectSource_autoPickDir(
  source: NewJamstackProjectSource,
  root: string
) {
  const basename = source instanceof GitURL ? source.name : source.shortName
  return fs_findAvailableDirAppendNumber(join(root, basename))
}
