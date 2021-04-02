import * as vscode from "vscode"

const purple = "#c586c0"
const yellow = "#dcdcaa"

export type DecorationType = keyof typeof decoration_types

const dt = vscode.window.createTextEditorDecorationType

export const decoration_types = {
  path_punctuation: dt({
    opacity: "0.5",
  }),
  path_slash: dt({
    opacity: "0.7",
  }),
  path_parameter: dt({
    color: yellow,
  }),
  path_parameter_type: dt({
    color: purple,
  }),
}
