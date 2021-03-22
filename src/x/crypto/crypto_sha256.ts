import { createHash } from "crypto"

export function crypto_sha256(str: string) {
  return createHash("sha256")
    .update(str)
    .digest("base64")
}
