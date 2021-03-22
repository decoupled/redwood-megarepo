import { memoize } from "lodash"
import { observable as o } from "mobx"
import * as vscode from "vscode"

export const vscode_mobx = memoize(() => new VSCodeMobx())

/**
 * exposes some vscode values in a reactive way.
 * subscribes to events and keeps them updated
 */
class VSCodeMobx {
  constructor() {
    this._activeTextEditor = vscode.window.activeTextEditor
    vscode.window.onDidChangeActiveTextEditor(
      (e) => (this._activeTextEditor = e)
    )

    this._visibleTextEditors = vscode.window.visibleTextEditors
    vscode.window.onDidChangeVisibleTextEditors(
      (e) => (this._visibleTextEditors = e)
    )

    this._workspaceFolders = vscode.workspace.workspaceFolders || []
    vscode.workspace.onDidChangeWorkspaceFolders(
      () => (this._workspaceFolders = vscode.workspace.workspaceFolders || [])
    )
  }

  get activeTextEditor$$() {
    return this._activeTextEditor
  }
  @o private _activeTextEditor: vscode.TextEditor | undefined

  get visibleTextEditors$$() {
    return this._visibleTextEditors
  }
  @o private _visibleTextEditors: vscode.TextEditor[]

  get workspaceFolders$$() {
    return this._workspaceFolders
  }
  @o private _workspaceFolders: readonly vscode.WorkspaceFolder[] = []
}
