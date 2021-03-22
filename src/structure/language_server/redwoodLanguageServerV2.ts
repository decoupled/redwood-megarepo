export const redwoodLanguageServerV2 = new LanguageServer({
  main: startLanguageServer,
})

function startLanguageServer() {
  // throw new Error("error from language server, process=" + process.version)
  console.log("starting language server...")
  new RWLanguageServer().start()
}

import { LanguageServer } from "lambdragon"
import { RWLanguageServer } from "./RWLanguageServer"
