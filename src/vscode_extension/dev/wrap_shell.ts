import { exec, spawn, ChildProcess } from "child_process"

export function wrap_shell() {}

async function testt() {
  console.log(process.argv)
  console.log(process.argv.slice(2))
  return
  console.log(">>>> start process wrapper")
  const tmpdir = "/Users/aldo/tmp/wrap_shell"
  const cmdstr_ = `yarn create react-app ${tmpdir}/react-app-3`
  const cmdstr = `yo code`
  const [cmd, ...args] = cmdstr.split(" ")
  const childProcess = spawn(cmd, args, {
    stdio: [process.stdin, process.stdout, process.stderr],
    cwd: tmpdir,
  }) // (A)
  await onExit(childProcess)
  console.log(">>>> end process wrapper")
}

testt()

function onExit(childProcess: ChildProcess): Promise<void> {
  return new Promise((resolve, reject) => {
    childProcess.once("exit", (code: number, signal: string) => {
      if (code === 0) {
        resolve(undefined)
      } else {
        reject(new Error("Exit with error code: " + code))
      }
    })
    childProcess.once("error", (err: Error) => {
      reject(err)
    })
  })
}
