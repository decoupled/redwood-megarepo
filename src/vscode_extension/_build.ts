import { crypto_filenameFriendlyHash } from "@decoupled/xlib"
import { emptyDirSync } from "fs-extra"
import { VSCE_TOKEN } from "src/secrets"
import { degit_with_retries } from "src/x/degit/degit_with_retries"
import { redwoodVSCodeExtension } from "./extension"

{
  redwoodVSCodeExtension.dev.publish({ marketplaceAuthToken: VSCE_TOKEN })
}

{
  redwoodVSCodeExtension.dev.buildAndOpen({
    openOnFolder:
      "/Users/aldo/com.github/redwoodjs/redwood_6/my-test-project-ts",
    disableOtherExtensions: false,
  })
}

{
  // the example-blog
  // openExtensionOn("git@github.com:redwoodjs/example-blog.git")
  // openExtensionOn("git@github.com:redwoodjs/example-todo.git")
  redwoodVSCodeExtension.dev.buildAndOpen({
    openOnFolder: "/Users/aldo/com.github/redwoodjs/example-blog",
    disableOtherExtensions: false,
  })
}

{
  // the actual redwood project (to test contributor mode)
  redwoodVSCodeExtension.dev.buildAndOpen({
    openOnFolder: "/Users/aldo/com.github/redwoodjs/redwood",
    disableOtherExtensions: false,
  })
}

{
  redwoodVSCodeExtension.dev.buildPackageAndShowOutput()
}

// a little dev time helper to test my extension in any redwood app I want

async function openExtensionOn(gitURL: string) {
  const dir = `/tmp/test-projects/${crypto_filenameFriendlyHash(gitURL)}`
  emptyDirSync(dir)
  await degit_with_retries(gitURL, dir)
  redwoodVSCodeExtension.dev.buildAndOpen({
    openOnFolder: dir,
    disableOtherExtensions: true,
  })
}
