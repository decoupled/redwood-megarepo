import { OutlineInfoResolver } from "src/structure/model/types"
import { memo } from "@decoupled/xlib"
import {
  RemoteTreeDataProviderImpl,
  RemoteTreeDataProvider_publishOverLSPConnection,
} from "src/x/vscode"

import { RWLanguageServer } from "./RWLanguageServer"

export class OutlineManager {
  constructor(public server: RWLanguageServer) {}

  @memo() start() {
    const getRoot = async () => {
      const p = this.server.getProject()
      if (!p)
        return {
          async children() {
            return [{ label: "No Redwood.js project found..." }]
          },
        }
      const oif = new OutlineInfoResolver(p)
      return await oif.treeItem()
    }

    const tdp = new RemoteTreeDataProviderImpl(getRoot, 10000)
    const methodPrefix = "redwoodjs/x-outline-"
    RemoteTreeDataProvider_publishOverLSPConnection(
      tdp,
      this.server.connection,
      methodPrefix
    )
  }
}
