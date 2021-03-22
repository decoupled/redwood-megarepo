import { createHash } from "crypto"

export function crypto_md5(str: string) {
  return createHash("md5")
    .update(str)
    .digest("base64")
}
