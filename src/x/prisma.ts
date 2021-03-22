/**
 * find "env()" expressions in a prisma file using regex
 * @param prismaSchemaFilePath
 */
export function* prisma_parseEnvExpressionsInFile(
  prismaSchemaFilePath: string
) {
  const uri = URL_fromFile(prismaSchemaFilePath)
  const file = URL_toFile(uri) // convert back and forth in case someone passed a uri
  if (!existsSync(file)) return [] // fail silently
  const src = readFileSync(file).toString()
  const exprs = prisma_parseEnvExpressions(src)
  for (const { range, key } of exprs) {
    const location: Location = { uri, range }
    yield { location, key }
  }
}

/**
 * find "env()" expressions in a prisma file using regex
 * @param src
 */
export function* prisma_parseEnvExpressions(src: string) {
  const re = /env\(([^)]+)\)/gm
  const matches = Array.from((src as any).matchAll(re)) as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const match of matches) {
    try {
      const start = Position_fromOffsetOrFail(match.index, src)
      const end = Position_fromOffsetOrFail(match.index + match[0].length, src)
      const range = Range.create(start, end)
      const key = JSON.parse(match[1])
      yield { range, key }
    } catch (e) {
      // we don't care about malformed env() calls
      // that should be picked up by the prisma parser
    }
  }
}

{
  // test: can find env() expressions in a prisma schema'
  const [r] = Array.from(prisma_parseEnvExpressions(`env("foo") `))
  const range = Range.create(0, 0, 0, 10)
  r
  //expect(r).toEqual({ range, key: "foo" })
}

import { existsSync, readFileSync } from "fs-extra"
import { Location, Range } from "vscode-languageserver"
import { URL_fromFile } from "./url/URL_fromFile"
import { URL_toFile } from "./url/URL_toFile"
import { Position_fromOffsetOrFail } from "./vscode-languageserver-types"
