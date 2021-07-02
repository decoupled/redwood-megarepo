import { VSCodeMeta, VSCodeView, VSCodeViewContainer, keep } from "lambdragon"
import { mapValues, values } from "lodash"
import { ids } from "src/vscode_extension/util/ids"
import { icon_rel_path } from "./icon_rel_path"

export const redwoodjs_view_container = new VSCodeViewContainer({
  id: "redwood",
  title: "Redwood.js",
  icon: "assets/icons2/redwood.svg",
  _parent: "activitybar",
})

export const redwoodjs_outline_view = new VSCodeView(() => {
  keep(menus_meta)
  return {
    id: ids.redwoodjs.views.outline.$id,
    name: "Project Outline",
    when: ids.redwoodjs.flags.redwoodjs_project_detected.$id,
    _container: redwoodjs_view_container,
  }
})

export function contextValue(str: string): string {
  return `${redwoodjs_outline_view.id}.contextValue.${str}`
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
  `_${redwoodjs_outline_view.id}.internal_menu_commands.`
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

const menus_meta = new VSCodeMeta(() => {
  const isThisView = `view == ${redwoodjs_outline_view.id}`
  return {
    commands: [...values(commands)],
    menus: {
      "view/title": [
        {
          command: commands.refresh.command,
          when: isThisView,
          group: "navigation",
        },
      ],
      "view/item/context": [...genMenus()],
    },
  }
  function* genMenus() {
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
})

function addCommandPropertyFromKey<T extends Record<string, any>>(
  cmds: T,
  base: string
): { [K in keyof T]: T[K] & { command: string } } {
  return mapValues(cmds, (cmd, k) => ({ ...cmd, command: base + k })) as any
}
