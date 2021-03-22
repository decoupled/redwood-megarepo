import degit from "degit"

/**
 * if git is not correctly installed, this will try different strategies
 * @param repo
 * @param dest
 */
export async function degit_with_retries(repo: string, dest: string) {
  try {
    // this one can fail if git is not correctly installed
    await degit(repo, { cache: false, force: true }).clone(dest)
  } catch (e) {
    await degit(repo, { cache: false }).clone(dest)
  }
}
