import vscode from "vscode"
import {
  NewJamstackProjectSource_parse,
  NewJamstackProjectSource,
} from "./NewJamstackProjectSource"

export async function NewJamstackProjectSource_prompt(): Promise<
  NewJamstackProjectSource | undefined
> {
  const v = await vscode.window.showInputBox({
    prompt:
      "Git Repo URL, Git repo name (netlify-templates/next-starter-jamstack), yarn/npm create template (create-react-app)",
    validateInput(x: string) {
      try {
        NewJamstackProjectSource_parse(x)
      } catch (e) {
        return "invalid value: " + e
      }
    },
  })
  if (typeof v === "undefined") return undefined
  return NewJamstackProjectSource_parse(v)
}
