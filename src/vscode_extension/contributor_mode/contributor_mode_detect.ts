import * as fs from "fs-extra"
import { join } from "path"
import vscode from "vscode"

/**
 * run some heuristics on a folder to determine if it is the redwood project itself (github.com/redwoodjs/redwood).
 * we could replace this for something more deliberate, like a file in the root that just says: REDWOOD
 * @param dir
 * @returns
 */
export function contributor_mode_detect(dir: string) {
  try {
    doCheck()
    return true
  } catch (e) {}
  return false
  function doCheck() {
    expectPackage("packages/core", "@redwoodjs/core")
    expectPackage("packages/api", "@redwoodjs/api")
    expectPackage("packages/web", "@redwoodjs/web")
    // expectFileIncludesText("LICENSE", "Copyright (c) 2021 Redwood")
  }
  // function expectFileIncludesText(file: string, str: string) {
  //   if (!fs.readFileSync(join(dir, file)).toString().includes(str)) fail()
  // }
  // function expectDirExists(p: string) {}
  function expectPackage(p: string, name: string) {
    if (fs.readJsonSync(join(dir, p, "package.json")).name !== name) fail()
  }
  function fail() {
    throw new Error("nope")
  }
}



export function contributor_mode_find_dir(): string | undefined {
  const wfs = vscode.workspace.workspaceFolders
  if (!wfs) {
    return
  }
  if (wfs.length !== 1) {
    return
  }
  const w = wfs[0]
  if (!w.uri.toString().startsWith("file://")) {
    return
  } // only local files
  const dir = w.uri.fsPath
  if (contributor_mode_detect(dir)) {
    return dir
  }
}