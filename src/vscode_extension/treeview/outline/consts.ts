import { VSCodeMeta } from "lambdragon"

import { mapValues, values } from "lodash"

import { redwoodjs_vsc_enabled } from "../../redwoodjs_vsc_enabled"

import { icon_rel_path } from "./icon_rel_path"

export const redwoodjs_treeview_id = "redwoodjs.treeview"
export const redwoodjs_treeview_data_id = "redwoodjs.treeview.data"
export const redwoodjs_treeview_docs_id = "redwoodjs.treeview.docs"
export const redwoodjs_treeview_logs_id = "redwoodjs.treeview.logs"

export function contextValue(str: string): string {
  return `${redwoodjs_treeview_id}.contextValue.${str}`
}

export const commands = addCommandPropertyFromKey(
  {
    doc: {
      title: "Documentation",
      icon: icon_rel_path("help"),
    },
    select: {
      title: "Select",
    },
    refresh: {
      title: "Refresh",
      icon: icon_rel_path("refresh"),
    },
    add: {
      title: "Add",
      icon: icon_rel_path("add"),
    },
    run: {
      title: "Run",
      icon: icon_rel_path("play"),
    },
    edit: {
      title: "Edit",
      icon: icon_rel_path("edit"),
    },
    openInBrowser: {
      title: "Open in Browser",
      icon: icon_rel_path("open_in_browser"),
    },
    openComponent: {
      title: "Open React Component",
      icon: icon_rel_path("open_component"),
    },
    openRoute: {
      title: "Open Route Definition",
      icon: icon_rel_path("open_route"),
    },
    delete: {
      title: "Delete",
    },
    dev_server_start: {
      title: "Start Dev Server",
    },
    dev_server_stop: {
      title: "Stop Dev Server",
    },
    dev_server_restart: {
      title: "Restart Dev Server",
    },
    db_up: {
      title: "rw db up",
    },
  },
  `${redwoodjs_treeview_id}.commands.`
)

export type Command = keyof typeof commands

export const itemTypes: {
  [k: string]: { inline?: Command[]; context?: Command[] }
} = {
  // ---- start new
  withDoc: {
    inline: ["doc"],
  },
  cli: {
    inline: ["run", "doc"],
  },
  group: {
    inline: ["add", "doc"],
  },
  route: {
    inline: ["openComponent", "openInBrowser", "openRoute"],
  },
  // ----- end new
}

export type NodeType = keyof typeof itemTypes

export const lsp_treeview_contributes_meta = new VSCodeMeta(() => {
  return lsp_treeview_contributes().contributes
})

function lsp_treeview_contributes() {
  const isThisView = `view == ${redwoodjs_treeview_id}`
  return {
    contributes: {
      commands: [...values(commands)],
      menus: {
        "view/title": [
          {
            command: commands.refresh.command,
            when: isThisView,
            group: "navigation",
          },
        ],
        "view/item/context": [...addMenus2()],
      },
      views: {
        redwood: [
          {
            id: redwoodjs_treeview_id,
            name: "Project Outline",
            when: redwoodjs_vsc_enabled,
          },
        ],
      },
      viewsContainers: {
        activitybar: [
          {
            id: "redwood",
            title: "Redwood.js",
            icon: "assets/icons2/redwood.svg",
          },
        ],
      },
    },
  }

  function* addMenus2() {
    for (const nodeType of Object.keys(itemTypes)) {
      const nn = itemTypes[nodeType]
      const when = `${isThisView} && viewItem == ${contextValue(nodeType)}`
      for (const cc of nn.context ?? []) {
        yield {
          command: commands[cc].command,
          when,
        }
      }
      for (const cc of nn.inline ?? []) {
        yield {
          command: commands[cc].command,
          when,
          group: "inline",
        }
      }
    }
  }
}

// function icon(name: string) {
//   return {
//     light: `assets/icons/light/${name}.svg`,
//     dark: `assets/icons/dark/${name}.svg`,
//   }
// }

function addCommandPropertyFromKey<T extends Record<string, any>>(
  cmds: T,
  base: string
): { [K in keyof T]: T[K] & { command: string } } {
  return mapValues(cmds, (cmd, k) => ({ ...cmd, command: base + k })) as any
}
