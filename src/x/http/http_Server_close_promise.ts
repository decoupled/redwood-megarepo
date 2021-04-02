import { Server } from "http"

export function http_Server_close_promise(server: Server): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    server.close((e) => {
      e ? reject(e) : resolve()
    })
  })
}
