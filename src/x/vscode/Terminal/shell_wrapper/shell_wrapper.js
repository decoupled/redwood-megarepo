/*
this file is embedded (see adjacent TS file for the macro)
*/
const cp = require("child_process")
const net = require("net")

run()

async function run() {
  const [_node, _wrapper, socketPort, cmd, ...args] = process.argv.concat()
  const pid = process.pid
  const cwd = process.cwd()

  if (typeof cmd !== "string") err_exit("shell_wrapper invalid arguments")

  const client = new net.Socket()
  client.connect(parseInt(socketPort), "localhost", () => {
    // TODO: we could also pipe stdout, stderr
    client.write("____PIDWRAPPER____(" + pid + ") ")
    const proc = cp.spawn(cmd, args, {
      stdio: [process.stdin, process.stdout, process.stderr],
    })
    client.write("____PID____(" + proc.pid + ") ")
    proc.once("exit", (code, signal) => {
      client.write("____EXIT____(" + code + ") ")
      process.exit(code)
    })
    proc.once("error", (err) => {
      //log({ event: "error", error: err ? err + "" : null })
    })
    client.on("data", (data) => {
      // console.log("client on data", data.toString())
      if (data.toString().includes("___KILL___")) proc_kill()
    })
    client.on("close", proc_kill)
    function proc_kill() {
      //console.log("proc_kill()")
      if (proc.killed) return
      proc.kill()
    }
  })
}

function err_exit(msg) {
  console.error(msg)
  process.exit(1)
}
