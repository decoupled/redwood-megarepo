import { vscode_ThemeIcon_memo as icon } from "src/x/vscode/vscode_ThemeIcon_memo"
import { SpinnerUtil } from "./SpinnerUtil"

export function buildLabelProps({
  label,
  description,
  state,
  iconPath,
}: {
  label: string
  description?: string
  state?: "running" | "disabled"
  iconPath?: any
}) {
  if (description === undefined) description = ""
  const useIcon = true
  const useSpinner = false
  const useDots = false
  if (state === "disabled") {
    description = label
    label = ""
  }
  if (state === "running") {
    if (useIcon) {
      const n = SpinnerUtil.num()
      const on = n % 2 === 0
      if (on) iconPath = icon("loading")
    }
    if (useSpinner) {
      label = SpinnerUtil.spinner() + label
    }
    if (useDots) {
      description = SpinnerUtil.dots()
    }
  }
  return { label, description, iconPath }
}
