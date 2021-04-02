import merge from "webpack-merge"
import { TreeItem_Menu_def as def, TreeItem_Menu_to_json } from "lambdragon"

const base = "jamstackide.treeview.menus"

export const menu_def_workflow = def({
  id: base + ".menu_def_workflow",
  commands: {
    open_diagram: {
      title: "Open Diagram",
      icon: "$(circuit-board)",
      group: "inline",
    },
  },
})

export function menus_contributes() {
  const defs = [
    //menu_def_logged_out,
    menu_def_workflow,
  ]
  return merge(defs.map(TreeItem_Menu_to_json))
}
