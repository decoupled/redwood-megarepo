import { crypto_sha256 } from "./crypto_sha256"

export function crypto_filenameFriendlyHash(str: string) {
  return crypto_sha256(str).replace(/\W/g, "").toLowerCase()
}

{
  crypto_filenameFriendlyHash("https://foobarbaz")
}
