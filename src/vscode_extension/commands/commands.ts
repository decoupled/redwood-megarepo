import { values } from "lodash"
import { redwoodjs_vsc_enabled } from "../redwoodjs_vsc_enabled"

const category = "Redwood"

const base = "redwoodjs.commands"

export const commands = {
  redwood_outline: {
    command: base + ".outline",
    title: "Show Project Outline",
    category,
  },

  redwood_generate: {
    command: base + ".generate",
    title: "Generate...",
    _doc: `Calls "$ redwood generate" in interactive mode.
      Generated files will not be written directly to disk. Instead, VSCode's workspace edit API will be used.
      This provides better integration with undo/redo and it lets you see all changes before saving.`,
    category,
  },

  redwood_cli: {
    command: "redwoodjs.cli", // delegate to the LSP directly
    title: "Interactive CLI...",
    _doc: `
      Starts the Redwood CLI in interactive mode.
      The interactive mode will inspect your project and schema to provide autocomplete and options whenever possible`,
    category,
  },

  // redwood_dev: {
  //   command: base + ".dev",
  //   title: "Open Dev Server",
  //   category,
  // },

  // redwood_dev_current: {
  //   command: base + ".dev_current",
  //   title: "Open Dev Server on Current Page/Component",
  //   category,
  // },

  // redwood_storybook: {
  //   command: base + ".storybook",
  //   title: "Open Storybook",
  //   category,
  // },

  // redwood_storybook_current: {
  //   command: base + ".storybook_current",
  //   title: "Open Storybook on current Page/Component",
  //   category,
  // },

  // redwood_graphql: {
  //   command: base + ".graphql",
  //   title: "Open GraphQL Playground",
  //   category,
  // },

  // redwood_debug: {
  //   command: base + ".debug",
  //   title: "Debug",
  //   category,
  // },
}

export function commands_pjson() {
  const commands_ = values(commands)
  const command_ids = commands_.map((c) => c.command)
  // only enable when in a redwood project
  const commandPalette = command_ids.map((command) => ({
    command,
    when: redwoodjs_vsc_enabled + "==true",
  }))
  return {
    contributes: {
      commands: commands_,
      menus: {
        commandPalette,
      },
    },
  }
}

{
  commands_pjson()
}
