import { vscode_ids } from "@decoupled/xlib"

/**
 * VSCode uses string IDs everywhere.
 * To preven typos and to enable "go to references"
 * we centralize all IDs here.
 * This also helps us prevent ID collisions.
 */
export const ids = vscode_ids({
  redwoodjs: {
    // this is the ID for the CLI command
    // it is implemented on the language server repo
    // we should rename it to redwoodjs.commands.cli
    // but for now we keep it here until we're sure we've replaced
    cli: {},
    commands: {
      outline: {},
      generate: {},
    },
    views: {
      outline: {},
      docs: {},
      contributor: {},
    },
    flags: { contributor_mode_enabled: {}, redwoodjs_project_detected: {} },
  },
  // by convention, command names starting with "_" are "private"
  // not meant to be called directly by users or by other extensions
  _redwoodjs: {
    commands: {
      show_new_version_message: {},
    },
  },
})

{
  // here's how you actually "use" an ID
  ids.redwoodjs.commands.outline.$id == "redwoodjs.commands.outline"
  // you can also access the last segment. this is useful in some scenarios
  ids.redwoodjs.commands.outline.$last == "outline"
}
