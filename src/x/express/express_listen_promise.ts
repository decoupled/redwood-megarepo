import { Express } from "express"
import { Server } from "http"

export function express_listen_promise(
  app: Express,
  port?: number
): Promise<Server> {
  return new Promise<Server>((resolve, reject) => {
    if (port) {
      const server = app.listen(port, () => {
        resolve(server)
        //e ? reject(e) : resolve(server)
      })
    } else {
      const server = app.listen((e) => {
        e ? reject(e) : resolve(server)
      })
    }
  })
}
