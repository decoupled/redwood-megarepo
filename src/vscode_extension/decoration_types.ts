import * as vscode from "vscode"

const purple = "#c586c0"
const yellow = "#dcdcaa"

export type DecorationType = keyof typeof decoration_types2

const dt = vscode.window.createTextEditorDecorationType

export const decoration_types2 = {
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

// export type DecorationType = keyof ReturnType<typeof decoration_types>

// export const decoration_types = memoize(() => {
//   const dt = vscode.window.createTextEditorDecorationType
//   return {
//     path_punctuation: dt({
//       opacity: "0.5",
//     }),
//     path_slash: dt({
//       opacity: "0.7",
//     }),
//     path_parameter: dt({
//       color: yellow,
//     }),
//     path_parameter_type: dt({
//       color: purple,
//     }),
//   }
// })
