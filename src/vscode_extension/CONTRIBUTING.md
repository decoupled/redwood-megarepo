# Development

If you want to contribute features to the extension:

- Checkout the Redwood monorepo
- Open "packages/vscode" in VSCode itself
  - Tip: You can run `code ./packages/vscode`
- Install the Lambdragon VSCode extension (this is the build tool that this package uses)
- Once lambragon is installed:
  - run `yarn dev` from the VSCode terminal

This will:

- Build the extension
- Download a simple Redwood.js project to use as sandbox
- Open a "debug" instance of VSCode with the extension loaded, pointing to the newly created project so you can try it out immediately

If you make changes to the extension, lambdragon will display a message giving you a change to reload.
It is not possible to do "hot reloading" if you modify core extension code.

However, if you modify code from any of the Webviews, they will reload automatically.
