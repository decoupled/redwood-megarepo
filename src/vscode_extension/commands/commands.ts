import { VSCodeCommand } from "lambdragon"
import { ids } from "../util/ids"

const category = "Redwood"

const _commandPalette_when =
  ids.redwoodjs.flags.redwoodjs_project_detected.$id + "==true"

export const commands_show_outline = new VSCodeCommand({
  command: ids.redwoodjs.commands.outline.$id,
  title: "Show Project Outline",
  category,
  _commandPalette_when,
})

export const commands_generate = new VSCodeCommand({
  command: ids.redwoodjs.commands.generate.$id,
  title: "Generate...",
  // _doc: `Calls "$ redwood generate" in interactive mode.
  //   Generated files will not be written directly to disk. Instead, VSCode's workspace edit API will be used.
  //   This provides better integration with undo/redo and it lets you see all changes before saving.`,
  category,
  _commandPalette_when,
})

export const commands_cli = new VSCodeCommand({
  command: ids.redwoodjs.cli.$id, // delegate to the LSP directly
  title: "Interactive CLI...",
  // _doc: `
  //   Starts the Redwood CLI in interactive mode.
  //   The interactive mode will inspect your project and schema to provide autocomplete and options whenever possible`,
  category,
})

export const commands_debug = new VSCodeCommand({
  command: ids.redwoodjs.commands.debug.$id,
  title: "Debug",
  category,
  _commandPalette_when,
})
