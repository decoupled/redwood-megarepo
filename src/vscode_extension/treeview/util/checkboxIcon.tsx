import { vscode_ThemeIcon_memo as icon } from "@decoupled/xlib"

export function checkboxIcon(checked = false) {
  return checked ? icon("check") : icon("chrome-maximize")
}
