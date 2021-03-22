import { vscode_ThemeIcon_memo as icon } from "src/x/vscode/vscode_ThemeIcon_memo"

export function checkboxIcon(checked = false) {
  return checked ? icon("check") : icon("chrome-maximize")
}
