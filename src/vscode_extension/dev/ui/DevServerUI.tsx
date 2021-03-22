export type DevServerStatus = "stopped" | "starting" | "started"

export interface DevServerUIModel {
  status: DevServerStatus
  componentDidMount?(): void
  view_logs?(): void
  start(): void
  restart(): void
  stop(): void
  description?: string
}
