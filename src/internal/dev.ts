import kill from "kill-port"

export function shutdownPort(port: number, method: "tcp" | "udp" = "tcp") {
  return kill(port, method)
}
