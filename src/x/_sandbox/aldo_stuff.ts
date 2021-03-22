import * as tsm from "ts-morph"
import { resolve } from "path"

import { TreeItem_Menu_def, TreeItem_Menu_to_json } from "lambdragon"

{
  const menu_def_stopped = TreeItem_Menu_def({
    id: "idid.item-stopped",
    commands: {
      start: {
        title: "Start Dev Server",
        icon: "$(play-circle)",
        group: "inline",
      },
    },
  })

  menu_def_stopped

  TreeItem_Menu_to_json(menu_def_stopped)
}

{
  const p = new tsm.Project({
    tsConfigFilePath: resolve(__dirname, "../../../tsconfig.json"),
  })
  p.getSourceFiles().length
}
