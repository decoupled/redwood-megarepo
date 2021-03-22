import { LazyGetter as lazy } from "lazy-get-decorator"
/**
 * TODO: support versions?
 */
export class YarnCreatePackageName {
  private constructor(public raw: string) {
    if (!this.raw.startsWith("create-")) {
      throw new Error("invalid create-* package name " + this.raw)
    }
  }
  /**
   * the name after the create-* part
   * for example "create-redwood-app" --> "redwood-app"
   */
  @lazy() get shortName() {
    const [__, ...rest] = this.value.split("-")
    return rest.join("-")
  }
  @lazy() get value() {
    return this.raw.trim()
  }
  commandFor(tool: "yarn" | "npm", targetDir?: string): string {
    const dir = targetDir ? " " + targetDir : ""
    if (tool === "yarn") return `yarn create ${this.shortName}` + dir
    return `npm init ${this.shortName}` + dir
  }
  static parse(str: string) {
    return new YarnCreatePackageName(str)
  }
}
