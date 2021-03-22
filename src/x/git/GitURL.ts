import { LazyGetter as lazy } from "lazy-get-decorator"
import git_url_parse from "git-url-parse"
import { parse as url_parse } from "url"

export class GitURL {
  private constructor(public raw: string) {
    const u = this.url_parsed
    if (u.protocol !== "https:") throw new Error("invalid git url " + raw)
    this.git_url_parsed // we want the parser to run upon construction
  }
  /**
   * the repo name (ex: 'redwood')
   */
  @lazy() get name(): string {
    const { name } = this.git_url_parsed
    if (typeof name !== "string") throw new Error("repo name is invalid")
    return name
  }
  /**
   * parsed with require("url").parse
   */
  @lazy() get url_parsed() {
    return url_parse(this.raw)
  }
  /**
   * parsed with require("git-url-parse")
   */
  @lazy() get git_url_parsed() {
    return git_url_parse(this.raw)
  }

  /**
   * will also handle "foo/bar" --> https://github.com/foo/bar
   * @param str
   */

  static parse(str: string) {
    const parts = str.split("/")
    if (parts.length === 2) str = "https://github.com/" + str + ".git"
    return new GitURL(str)
  }
}

{
  GitURL.parse("https://github.com/foo/bar").git_url_parsed
}
