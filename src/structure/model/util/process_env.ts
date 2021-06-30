import { iter } from "@decoupled/xlib"
import { readFileSync } from "fs-extra"
import glob from "glob"
import { join } from "path"
import { tsm_SourceFile_create_cached } from "src/x/ts-morph/tsm_SourceFile_create"
import * as tsm from "ts-morph"

export function process_env_findAll(dir: string) {
  return iter(function* () {
    for (const file of glob.sync(join(dir, "src/**/*.{js,ts,jsx,tsx}")))
      yield* process_env_findInFile(file, readFileSync(file).toString())
  })
}

export function process_env_findInFile(filePath: string, text: string) {
  if (!text.includes("process.env")) return []
  try {
    return process_env_findInFile2(tsm_SourceFile_create_cached(filePath, text))
  } catch (e) {
    return []
  }
}

export function process_env_findInFile2(sf: tsm.SourceFile) {
  const penvs = sf
    .getDescendantsOfKind(tsm.SyntaxKind.PropertyAccessExpression)
    .filter(is_process_env)
  return iter(function* () {
    for (const penv of penvs) {
      const node = penv.getParent()
      if (!node) continue
      if (tsm.Node.isPropertyAccessExpression(node)) {
        yield { key: node.getName(), node }
      } else if (tsm.Node.isElementAccessExpression(node)) {
        const arg = node.getArgumentExpression()
        if (!arg) continue
        if (!tsm.Node.isStringLiteral(arg)) continue
        yield { key: arg.getLiteralText(), node }
      }
    }
  })
}

function is_process_env(n: tsm.Node): n is tsm.PropertyAccessExpression {
  if (!tsm.Node.isPropertyAccessExpression(n)) return false
  return n.getExpression().getText() === "process" && n.getName() === "env"
}
