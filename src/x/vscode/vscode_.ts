/**
 * load vscode using require. using this will prevent module bundlers (like parcel)
 * from trying to bundle vscode
 */
export function vscode_(): typeof import("vscode") {
  try {
    // we're adding a try block here to keep "esbuild" and other build tools from yapping at us
    /*
    > src/x/vscode/vscode_.ts:7:9: warning: This call to "require" will not be bundled because the argument is not a string literal (surround with a try/catch to silence this warning)
    7 │   return require(vv)
      ╵          ~~~~~~~
    */
    const vv = "vscode"
    return require(vv)
  } catch (e) {
    throw e
  }
}

export function vscode_or_undefined(): typeof import("vscode") | undefined {
  try {
    const vv = "vscode"
    return require(vv)
  } catch (e) {
    return undefined
  }
}
