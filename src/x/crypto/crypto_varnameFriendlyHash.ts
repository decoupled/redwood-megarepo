import { crypto_sha256 } from "./crypto_sha256"

export function crypto_varnameFriendlyHash(str: string, len?: number) {
  const varname = "_" + crypto_sha256(str).replace(/\W/g, "")
  if (typeof len === "undefined") return varname
  return varname.slice(0, len)
}
