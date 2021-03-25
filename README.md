- This repo contains a new version of the Redwood.js VSCode extension and the `@redwoodjs/structure` package.
- It is organized as a `megarepo` - a simpler project layout that fixes many of the shortcomings of monorepos
- It will be merged into the Redwood.js codebase once we stabilize the code. For now, it is undergoing massive changes on a daily basis


## I want to build and run the Redwood VSCode extension...

Ok, but keep in mind this is highly experimental and might not work:

1. Clone this repo
2. yarn install
3. Open in VSCode
4. Install the [Lambdragon VSCode Extension](https://marketplace.visualstudio.com/items?itemName=decoupled.lambdragon)
5. Open `src/vscode_extension/_build.ts` in the editor

Click on the playground that looks like this:

(If you don't know what a playground is, then you're probably not supposed to be trying this out :))

```ts
{
  redwoodVSCodeExtension.dev.buildAndOpen({
    // replace the following with a path to a redwood project on your machine
    openOnFolder: "/path/to/some/redwood/project",
    disableOtherExtensions: true,
  })
}
```

Q: I tried and it doesn't work. Why?
A: Told you! The thing is, the build tool/extension (lambdragon) and this repo are going through major changes at the same time. So they keep falling out of sync. As soon as both stabilize, this will end. That's the price you pay for having separate repos for projects that are evolving together :)
