import { wait } from "../Promise/wait"
export async function http_wait_until_status_200(
  url: string,
  timeout = 10000
): Promise<void> {
  const start = Date.now()
  // console.log("http_wait_until_status_200")
  while (true) {
    // console.log("will fetch")
    const status = (await fetch(url)).status
    // console.log("status = ", status)
    if (status === 200) return
    await wait(1000)
    const elapsed = Date.now() - start
    if (elapsed > timeout) throw new Error("timeout")
  }
}
