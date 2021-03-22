import { hb } from "src/x/handlebars/template_parser"
import { resolve } from "path"
import * as fs from "fs-extra"
import { CLI } from "lambdragon"

export const page_js = x9.preval.expr(() => hb(__dirname + "/page.js.template"))
export const mini = x9.preval.expr(() => {
  throw new Error("bad template")
  return hb(__dirname + "/mini.handlebars")
})

const version = x9.preval(() => getPackageDotJSONVersion())

function getPackageDotJSONVersion() {
  const pjson = resolve(__dirname, "../../package.json")
  const pjson_content = JSON.parse(fs.readFileSync(pjson).toString())
  return pjson_content.version
}
