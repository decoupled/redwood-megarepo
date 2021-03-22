// do NOT change this file
// this script is preval'd and embedded by dry_run.ts
// read that file for more info
const proxyquire = require("proxyquire")
const fs = require("fs")
const path = require("path")
const files = {}
const fileOverrides = { FILE: "OVERRIDES" }
const FILE_SCHEME = "file://"

function URL_file(f) {
  if (f.startsWith(FILE_SCHEME)) f = f.substr(FILE_SCHEME.length)
  return new URL(FILE_SCHEME + path.normalize(f)).href
}

proxyquire("@redwoodjs/cli/dist", {
  fs: {
    mkdir() {},
    mkdirSync(...args) {},
    writeFile(a, b) {
      files[URL_file(a)] = b
    },
    writeFileSync(a, b) {
      files[URL_file(a)] = b
    },
    readFileSync(...args) {
      const f = URL_file(args[0])
      if (fileOverrides[f]) return fileOverrides[f]
      return fs.readFileSync.apply(fs, args)
    },
    "@global": true,
  },
})

process.on("exit", () => {
  console.log("__SEPARATOR__")
  console.log(JSON.stringify(files, null, 2))
})
