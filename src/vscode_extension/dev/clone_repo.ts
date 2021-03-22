import * as fs from "fs-extra"
import { ensureDirSync } from "fs-extra"
import { LazyGetter as lazy } from "lazy-get-decorator"
import { Memoize as memo } from "lodash-decorators"
import { dirname, join } from "path"
import { degit_with_retries } from "src/x/degit/degit_with_retries"
import { GitURL } from "src/x/git/GitURL"
import { vscode_run } from "src/x/vscode/vscode_run"
import vscode from "vscode"
import { TargetDirSpecification } from "../util/TargetDirSpecification"
import { TargetDirSpecification_resolve_vsc } from "../util/TargetDirSpecification_resolve_vsc"

interface Opts {
  gitUrl: GitURL
  /**
   * will use npx degit instead of git lone (must faster, but disconnects from repo)
   */
  degit?: boolean
  targetDir: TargetDirSpecification
}

export function clone_repo(opts: Opts) {
  return new CloneRepo(opts).clone()
}

export function clone_repo_dry(opts: Opts) {
  return new CloneRepo(opts).clone_dry()
}

class CloneRepo {
  constructor(private opts: Opts) {}
  @memo() async start(): Promise<vscode.Uri | undefined> {
    // TODO: add more checks
    // for now we just try to git clone
    return await this.clone_withProgress()
  }

  @memo() private async resolvedTargetDir() {
    const { targetDir } = this.opts
    return await TargetDirSpecification_resolve_vsc({
      targetDir,
      autoNamePrefix: this.opts.gitUrl.name,
    })
  }

  @memo() async clone_withProgress() {
    const { repo_url } = this
    const destFolder = await this.resolvedTargetDir()
    if (!destFolder) return
    return await vscode.window.withProgress<vscode.Uri | undefined>(
      {
        location: vscode.ProgressLocation.Notification,
        title: `cloning ${repo_url} into ${destFolder}`,
      },
      () => this.clone()
    )
  }

  @memo() async clone(): Promise<vscode.Uri | undefined> {
    const { repo_url } = this
    const destFolder = await this.resolvedTargetDir()
    if (!destFolder) return
    if (!repo_url) return
    await actual_clone(repo_url, destFolder, this.opts.degit)
    return vscode.Uri.file(destFolder)
  }

  @memo() async clone_dry(): Promise<string | undefined> {
    const { repo_url } = this
    const destFolder = await this.resolvedTargetDir()
    if (!destFolder) return
    ensureDirSync(destFolder)
    if (this.opts.degit) {
      return `npx degit ${repo_url} ${destFolder}`
    }
    return `git clone ${repo_url} ${destFolder}`
  }

  @lazy() get repo_url(): string | undefined {
    return this.opts.gitUrl.raw
  }
}

async function actual_clone(repo: string, dest: string, degit?: boolean) {
  ensureDirSync(dirname(dest))
  if (degit) {
    try {
      // fastest way to clone and degit is to use "degit"
      await degit_with_retries(repo, dest)
    } catch (e) {
      await vscode_run({ cmd: `git clone --depth 1 ${repo} ${dest}` })
      const dotgit = join(dest, ".git")
      if (fs.existsSync(dotgit)) await fs.remove(dotgit)
    }
  } else {
    // otherwise just git clone
    await vscode_run({ cmd: `git clone ${repo} ${dest}` })
    // await simple_git(destFolder).clone(repo_url!, destFolder)
  }
}
