export async function ProviderResult_normalize<T>(
  x: vscode.ProviderResult<T>
): Promise<T | undefined> {
  if (isThenable(x)) return await ProviderResult_normalize(await x)
  if (x === null) return undefined
  return x
}

function isThenable(x: unknown): x is Thenable<unknown> {
  if (typeof x !== "object") return false
  if (x === null) return false
  return typeof (x as any)["then"] === "function"
}

import * as vscode from "vscode"
