import * as Handlebars from "handlebars"
import { readFileSync } from "fs"

// this function takes a string and returns a compiled
// handlebars template (the string representation)
export function compileHandlebarsTemplate(templateSource: string) {
  const compiled = Handlebars.precompile(templateSource)
  return `require("handlebars").template(${compiled})`
}

export function hb(filePath: string) {
  return compileHandlebarsTemplate(readFileSync(filePath).toString())
}

// this preval will "inject" the compiled template into the AST
const template1 = x9.preval.expr(() =>
  compileHandlebarsTemplate("hello {{name}}, how are you doing?")
)

{
  template1({ name: "Marco" })
}
