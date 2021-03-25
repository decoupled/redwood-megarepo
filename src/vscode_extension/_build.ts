import { emptyDirSync } from "fs-extra"
import { crypto_filenameFriendlyHash } from "src/x/crypto/crypto_filenameFriendlyHash"
import { degit_with_retries } from "src/x/degit/degit_with_retries"
import { redwoodVSCodeExtension } from "./extension"


{
  // openExtensionOn("git@github.com:redwoodjs/example-blog.git")
  // openExtensionOn("git@github.com:redwoodjs/example-todo.git")
  redwoodVSCodeExtension.dev.buildAndOpen({
    openOnFolder: "/Users/aldo/com.github/redwoodjs/example-blog",
    disableOtherExtensions: true,
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
  redwoodVSCodeExtension.dev.buildAndOpen({ openOnFolder: dir, disableOtherExtensions: true })
}